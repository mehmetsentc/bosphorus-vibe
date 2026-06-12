const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const axios = require("axios");

admin.initializeApp();

ffmpeg.setFfmpegPath(ffmpegStatic);

const REGION = "europe-central2";
const TRANSCODE_RUN_OPTS = { memory: "2GB", timeoutSeconds: 540 };
const BATCH_SIZE = 3;

function getPostUserId(data) {
  const ref = data.postUser;
  if (!ref) return null;
  if (typeof ref === "string") {
    const parts = ref.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
  if (ref.id) return ref.id;
  if (ref.path) {
    const parts = ref.path.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
  return null;
}

function getOriginalVideoUrl(data) {
  return data.postVideoURL_original || data.postVideo || data.postVideoURL || "";
}

function hasServerTranscodedLow(data, postId) {
  const low = data.postVideoURL_low || "";
  const original = getOriginalVideoUrl(data);
  if (!low || low === original) return false;

  const decoded = decodeStoragePathFromUrl(low);
  if (decoded && decoded.includes(`/videos/${postId}/low.mp4`)) return true;
  return low.includes(`/videos/${postId}/`);
}

function needsVideoTranscode(data, postId) {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;
  if (data.videoTranscodeStatus === "done" && hasServerTranscodedLow(data, postId)) {
    return false;
  }
  if (data.videoTranscodeStatus === "skipped") return false;
  if (hasServerTranscodedLow(data, postId)) return false;
  return true;
}

function getBackfillSecret() {
  return (
    process.env.TRANSCODE_BACKFILL_SECRET ||
    functions.config().transcode?.backfill_secret ||
    ""
  );
}

const ALLOWED_ORIGINS = [
  "https://bosphorusvibe.com",
  "https://www.bosphorusvibe.com",
  "http://localhost:3000",
];

function applyCors(req, res) {
  const origin = req.get("origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

function handleCorsPreflight(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

function assertBackfillAuth(req) {
  const secret = getBackfillSecret();
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (secret && token === secret) return;
  const err = new Error("Unauthorized");
  err.status = 401;
  throw err;
}

async function assertBackfillOrAdminAuth(req) {
  const secret = getBackfillSecret();
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (secret && token === secret) return;

  if (token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
      if (userDoc.data()?.role === "admin") return;
    } catch {
      // fall through
    }
  }

  const err = new Error("Unauthorized");
  err.status = 401;
  throw err;
}

/**
 * Download original, transcode to 480p H.264, upload low.mp4, update Firestore.
 */
async function transcodeVideoForPost(postId, data, docRef) {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) {
    await docRef.update({
      videoTranscodeStatus: "skipped",
      videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: false, reason: "no_video" };
  }

  const low = data.postVideoURL_low;
  if (hasServerTranscodedLow(data, postId)) {
    await docRef.update({
      videoTranscodeStatus: "done",
      videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, reason: "already_done" };
  }

  const tmpInput = path.join(os.tmpdir(), `${postId}_orig`);
  const tmpOutput = path.join(os.tmpdir(), `${postId}_low.mp4`);

  await docRef.update({
    videoTranscodeStatus: "processing",
    videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  try {
    const response = await axios.get(originalUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
      maxContentLength: 500 * 1024 * 1024,
    });
    fs.writeFileSync(tmpInput, Buffer.from(response.data));

    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput)
        .videoFilter(
          "scale='min(854,iw)':'min(480,ih)':force_original_aspect_ratio=decrease:flags=lanczos",
        )
        .videoCodec("libx264")
        .addOption("-crf", "28")
        .addOption("-preset", "fast")
        .addOption("-profile:v", "baseline")
        .addOption("-level", "3.0")
        .audioCodec("aac")
        .audioBitrate("64k")
        .addOption("-movflags", "+faststart")
        .format("mp4")
        .on("end", resolve)
        .on("error", reject)
        .save(tmpOutput);
    });

    const bucket = admin.storage().bucket();
    const userId = getPostUserId(data);
    if (!userId) {
      throw new Error("missing postUser");
    }

    const storagePath = `users/${userId}/videos/${postId}/low.mp4`;
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    await bucket.upload(tmpOutput, {
      destination: storagePath,
      metadata: {
        contentType: "video/mp4",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });

    const lowUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(storagePath)}?alt=media&token=${token}`;

    await docRef.update({
      postVideoURL_low: lowUrl,
      postVideoURL: lowUrl,
      videoTranscodeStatus: "done",
      videoTranscodeError: admin.firestore.FieldValue.delete(),
      videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`transcodeVideoForPost: done postId=${postId}`);
    return { ok: true, reason: "transcoded" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    functions.logger.error(`transcodeVideoForPost: failed postId=${postId}`, err);
    await docRef.update({
      videoTranscodeStatus: "failed",
      videoTranscodeError: message.slice(0, 500),
      videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: false, reason: "failed", error: message };
  } finally {
    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
  }
}

async function processPendingBatch(limit = BATCH_SIZE) {
  const db = admin.firestore();
  const snap = await db
    .collection("userPosts")
    .where("videoTranscodeStatus", "==", "pending")
    .limit(limit)
    .get();

  const results = [];
  for (const doc of snap.docs) {
    const result = await transcodeVideoForPost(doc.id, doc.data(), doc.ref);
    results.push({ postId: doc.id, ...result });
  }

  return {
    processed: snap.size,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}

/** New video posts — transcode when low quality is not yet available. */
exports.transcodeVideoPost = functions
  .region(REGION)
  .runWith(TRANSCODE_RUN_OPTS)
  .firestore.document("userPosts/{postId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!needsVideoTranscode(data, snap.id)) return null;
    await transcodeVideoForPost(snap.id, data, snap.ref);
    return null;
  });

/** Every 30 minutes — process a small batch of queued videos. */
exports.processPendingVideoTranscodes = functions
  .region(REGION)
  .runWith(TRANSCODE_RUN_OPTS)
  .pubsub.schedule("every 30 minutes")
  .onRun(async () => {
    const summary = await processPendingBatch(BATCH_SIZE);
    functions.logger.info("processPendingVideoTranscodes", summary);
    return null;
  });

/** Manual batch trigger — secured with TRANSCODE_BACKFILL_SECRET. */
exports.runVideoTranscodeBatch = functions
  .region(REGION)
  .runWith(TRANSCODE_RUN_OPTS)
  .https.onRequest(async (req, res) => {
    if (handleCorsPreflight(req, res)) return;
    applyCors(req, res);

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await assertBackfillOrAdminAuth(req);
      const limit = Math.min(
        Math.max(parseInt(req.body?.limit, 10) || BATCH_SIZE, 1),
        5,
      );
      const summary = await processPendingBatch(limit);
      res.json(summary);
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({
        error: err instanceof Error ? err.message : "Internal error",
      });
    }
  });

// --- Video thumbnail backfill (cover frame from video) ---

const THUMBNAIL_BATCH_SIZE = 5;
const THUMBNAIL_RUN_OPTS = { memory: "1GB", timeoutSeconds: 540 };

function decodeStoragePathFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    if (!encoded) return null;
    return decodeURIComponent(encoded.split("?")[0]);
  } catch {
    return null;
  }
}

function thumbStoragePath(originalUrl, userId, postId) {
  const decoded = decodeStoragePathFromUrl(originalUrl);
  if (decoded && /original\.[a-z0-9]+$/i.test(decoded)) {
    return decoded.replace(/original\.[a-z0-9]+$/i, "thumb.jpg");
  }
  if (decoded && decoded.includes("/uploads/")) {
    return decoded.replace(/\/[^/]+$/, "/thumb.jpg");
  }
  return `users/${userId}/uploads/${postId}/thumb.jpg`;
}

function isImageMediaUrlServer(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  if (/\.(mp4|mov|webm|m4v|avi|mkv|m4a)(\?|$)/.test(lower)) return false;
  return /\.(jpg|jpeg|png|gif|webp|heic|heif)(\?|$)/i.test(lower) || !/\.[a-z0-9]+(\?|$)/i.test(lower);
}

async function uploadThumbJpeg(storagePath, localPath) {
  const bucket = admin.storage().bucket();
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType: "image/jpeg",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return (
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${token}`
  );
}

async function regenerateThumbnailForPost(postId, data, docRef) {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) {
    await docRef.update({
      videoThumbnailStatus: "skipped",
      videoThumbnailUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: false, reason: "no_video" };
  }

  const existingThumb = data.postVideothumbnail;
  if (
    data.videoThumbnailStatus === "done" &&
    existingThumb &&
    isImageMediaUrlServer(existingThumb) &&
    existingThumb !== originalUrl
  ) {
    return { ok: true, reason: "already_done" };
  }

  const tmpInput = path.join(os.tmpdir(), `${postId}_thumb_src`);
  const tmpOutput = path.join(os.tmpdir(), `${postId}_thumb.jpg`);

  await docRef.update({
    videoThumbnailStatus: "processing",
    videoThumbnailUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  try {
    const response = await axios.get(originalUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
      maxContentLength: 500 * 1024 * 1024,
    });
    fs.writeFileSync(tmpInput, Buffer.from(response.data));

    await new Promise((resolve, reject) => {
      ffmpeg(tmpInput)
        .seekInput(0.5)
        .frames(1)
        .outputOptions(["-q:v", "4"])
        .on("end", resolve)
        .on("error", reject)
        .save(tmpOutput);
    });

    const userId = getPostUserId(data);
    if (!userId) {
      throw new Error("missing postUser");
    }

    const storagePath = thumbStoragePath(originalUrl, userId, postId);
    const thumbUrl = await uploadThumbJpeg(storagePath, tmpOutput);

    await docRef.update({
      postVideothumbnail: thumbUrl,
      videoThumbnailStatus: "done",
      videoThumbnailError: admin.firestore.FieldValue.delete(),
      videoThumbnailUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`regenerateThumbnailForPost: done postId=${postId}`);
    return { ok: true, reason: "regenerated", thumbUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    functions.logger.error(`regenerateThumbnailForPost: failed postId=${postId}`, err);
    await docRef.update({
      videoThumbnailStatus: "failed",
      videoThumbnailError: message.slice(0, 500),
      videoThumbnailUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: false, reason: "failed", error: message };
  } finally {
    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
  }
}

async function processPendingThumbnailBatch(limit = THUMBNAIL_BATCH_SIZE) {
  const db = admin.firestore();
  const snap = await db
    .collection("userPosts")
    .where("videoThumbnailStatus", "==", "pending")
    .limit(limit)
    .get();

  const results = [];
  for (const doc of snap.docs) {
    const result = await regenerateThumbnailForPost(doc.id, doc.data(), doc.ref);
    results.push({ postId: doc.id, ...result });
  }

  return {
    processed: snap.size,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok && r.reason !== "no_video" && r.reason !== "already_done").length,
    results,
  };
}

/** Every 30 minutes — regenerate broken/missing video thumbnails. */
exports.processPendingVideoThumbnails = functions
  .region(REGION)
  .runWith(THUMBNAIL_RUN_OPTS)
  .pubsub.schedule("every 30 minutes")
  .onRun(async () => {
    const summary = await processPendingThumbnailBatch(THUMBNAIL_BATCH_SIZE);
    functions.logger.info("processPendingVideoThumbnails", summary);
    return null;
  });

/** Manual thumbnail batch — secured with TRANSCODE_BACKFILL_SECRET. */
exports.runVideoThumbnailBatch = functions
  .region(REGION)
  .runWith(THUMBNAIL_RUN_OPTS)
  .https.onRequest(async (req, res) => {
    if (handleCorsPreflight(req, res)) return;
    applyCors(req, res);

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      await assertBackfillOrAdminAuth(req);
      const limit = Math.min(
        Math.max(parseInt(req.body?.limit, 10) || THUMBNAIL_BATCH_SIZE, 1),
        8,
      );
      const summary = await processPendingThumbnailBatch(limit);
      res.json(summary);
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({
        error: err instanceof Error ? err.message : "Internal error",
      });
    }
  });

exports.onUserDeleted = functions
  .region(REGION)
  .auth.user()
  .onDelete(async (user) => {
    const firestore = admin.firestore();
    await firestore.collection("users").doc(user.uid).delete();
  });
