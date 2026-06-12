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

function needsVideoTranscode(data) {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;
  if (data.videoTranscodeStatus === "done" || data.videoTranscodeStatus === "skipped") {
    return false;
  }
  const low = data.postVideoURL_low;
  if (low && low !== originalUrl) return false;
  return true;
}

function getBackfillSecret() {
  return (
    process.env.TRANSCODE_BACKFILL_SECRET ||
    functions.config().transcode?.backfill_secret ||
    ""
  );
}

function assertBackfillAuth(req) {
  const secret = getBackfillSecret();
  if (!secret) {
    throw new Error("TRANSCODE_BACKFILL_SECRET is not configured");
  }
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== secret) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
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
  if (low && low !== originalUrl) {
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
    if (!needsVideoTranscode(data)) return null;
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
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      assertBackfillAuth(req);
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

exports.onUserDeleted = functions
  .region(REGION)
  .auth.user()
  .onDelete(async (user) => {
    const firestore = admin.firestore();
    await firestore.collection("users").doc(user.uid).delete();
  });
