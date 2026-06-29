/**
 * Sync Firestore video tier URLs from existing Storage files + auto-enqueue missing encodes.
 */

const admin = require("firebase-admin");
const {
  standardEncodePaths,
  buildFirebaseDownloadUrl,
} = require("./video-encode");

const STORAGE_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** CLI + Cloud Functions — initialize the module's firebase-admin singleton. */
function initFirebaseAdmin(options) {
  if (admin.apps.length > 0) return admin.app();
  return admin.initializeApp(options);
}

function requireAdminApp() {
  if (admin.apps.length === 0) {
    throw new Error(
      "Firebase Admin başlatılmadı — önce initFirebaseAdmin() çağırın",
    );
  }
  return admin.app();
}

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

function hasFirestoreTierUrl(data, postId, tier) {
  const field =
    tier === "preview"
      ? data.postVideoURL_preview
      : tier === "medium"
        ? data.postVideoURL_medium
        : tier === "low"
          ? data.postVideoURL_low
          : data.postVideoURL_high;
  if (typeof field !== "string" || !field) return false;
  return field.includes(`/videos/${postId}/`) && field.includes(`/${tier}.mp4`);
}

function hasServerEncodedVariants(data, postId) {
  return (
    hasFirestoreTierUrl(data, postId, "preview") ||
    hasFirestoreTierUrl(data, postId, "low")
  );
}

function postNeedsVideoTranscode(data, postId) {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;
  if (data.videoTranscodeStatus === "skipped") return false;
  if (data.videoTranscodeStatus === "failed") return false;
  if (data.videoTranscodeStatus === "processing") return false;
  if (hasServerEncodedVariants(data, postId)) return false;
  if (data.videoTranscodeStatus === "done") return false;
  return true;
}

function postNeedsStorageSync(data, postId) {
  if (!getOriginalVideoUrl(data)) return false;
  if (hasServerEncodedVariants(data, postId)) return false;
  return true;
}

async function ensureDownloadUrl(bucket, storagePath) {
  const file = bucket.file(storagePath);
  const [exists] = await file.exists();
  if (!exists) return null;

  const [metadata] = await file.getMetadata();
  let token = metadata.metadata?.firebaseStorageDownloadTokens;
  if (!token) {
    token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await file.setMetadata({
      metadata: { firebaseStorageDownloadTokens: token },
      cacheControl: STORAGE_MEDIA_CACHE_CONTROL,
    });
  } else {
    token = String(token).split(",")[0];
  }

  return buildFirebaseDownloadUrl(bucket.name, storagePath, token);
}

/**
 * If encode tiers already exist in Storage, write tokenized URLs to Firestore (no FFmpeg).
 */
async function syncPostTiersFromStorage(postId, data, docRef) {
  const userId = getPostUserId(data);
  if (!userId) return { ok: false, reason: "no_user" };

  const bucket = admin.storage().bucket();
  const paths = standardEncodePaths(userId, postId);
  const tierMap = [
    ["preview", paths.preview, "postVideoURL_preview"],
    ["medium", paths.medium, "postVideoURL_medium"],
    ["low", paths.low, "postVideoURL_low"],
    ["high", paths.high, "postVideoURL_high"],
  ];

  const updates = {};
  let synced = 0;

  for (const [tier, storagePath, field] of tierMap) {
    if (hasFirestoreTierUrl(data, postId, tier)) continue;
    const url = await ensureDownloadUrl(bucket, storagePath);
    if (!url) continue;
    updates[field] = url;
    synced += 1;
  }

  if (!synced) return { ok: false, reason: "nothing_in_storage" };

  if (updates.postVideoURL_low) {
    updates.postVideoURL = updates.postVideoURL_low;
  } else if (updates.postVideoURL_preview) {
    updates.postVideoURL = updates.postVideoURL_preview;
  }

  updates.videoTranscodeStatus = "done";
  updates.videoTranscodeError = admin.firestore.FieldValue.delete();
  updates.videoTranscodeUpdatedAt = admin.firestore.FieldValue.serverTimestamp();

  await docRef.update(updates);
  return { ok: true, reason: "synced", synced };
}

async function scanPostsPage(db, lastId, pageSize) {
  let query = db.collection("userPosts").orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
  if (lastId) query = query.startAfter(lastId);
  return query.get();
}

async function syncStorageBatch(limit = 50, onProgress) {
  requireAdminApp();
  const db = admin.firestore();
  let lastId;
  let scanned = 0;
  let synced = 0;
  let skipped = 0;

  while (synced < limit) {
    const snap = await scanPostsPage(db, lastId, 100);
    if (snap.empty) break;

    for (const doc of snap.docs) {
      scanned += 1;
      if (onProgress && scanned % 25 === 0) {
        onProgress({ phase: "sync", scanned, synced, skipped });
      }

      const data = doc.data();
      if (!postNeedsStorageSync(data, doc.id)) {
        skipped += 1;
        continue;
      }

      const result = await syncPostTiersFromStorage(doc.id, data, doc.ref);
      if (result.ok) synced += 1;
      if (synced >= limit) break;
    }

    lastId = snap.docs[snap.docs.length - 1]?.id;
    if (snap.size < 100) break;
  }

  return { scanned, synced, skipped, hasMore: Boolean(lastId && synced >= limit) };
}

async function enqueueTranscodeBatch(limit = 100, onProgress) {
  requireAdminApp();
  const db = admin.firestore();
  let lastId;
  let scanned = 0;
  let marked = 0;
  let alreadyQueued = 0;

  while (marked < limit) {
    const snap = await scanPostsPage(db, lastId, 100);
    if (snap.empty) break;

    const batch = db.batch();
    let writes = 0;

    for (const doc of snap.docs) {
      scanned += 1;
      if (onProgress && scanned % 50 === 0) {
        onProgress({ phase: "enqueue", scanned, marked, alreadyQueued });
      }

      const data = doc.data();
      if (!postNeedsVideoTranscode(data, doc.id)) continue;

      const status = data.videoTranscodeStatus;
      if (status === "pending" || status === "processing") {
        alreadyQueued += 1;
        continue;
      }

      batch.update(doc.ref, {
        videoTranscodeStatus: "pending",
        videoTranscodeUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      marked += 1;
      writes += 1;
      if (marked >= limit) break;
    }

    if (writes > 0) await batch.commit();
    lastId = snap.docs[snap.docs.length - 1]?.id;
    if (snap.size < 100) break;
  }

  return { scanned, marked, alreadyQueued, hasMore: Boolean(lastId && marked >= limit) };
}

module.exports = {
  initFirebaseAdmin,
  getPostUserId,
  getOriginalVideoUrl,
  hasServerEncodedVariants,
  postNeedsVideoTranscode,
  postNeedsStorageSync,
  syncPostTiersFromStorage,
  syncStorageBatch,
  enqueueTranscodeBatch,
};
