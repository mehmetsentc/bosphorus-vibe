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

/**
 * Triggered when a new userPost is created.
 * If it has a video, downloads the original, transcodes to 480p with
 * libx264/CRF-28, uploads as low.mp4, and writes postVideoURL_low back.
 */
exports.transcodeVideoPost = functions
  .region("europe-central2")
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .firestore.document("userPosts/{postId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const originalUrl = data.postVideoURL_original || data.postVideo || data.postVideoURL;

    // Skip non-video posts or already-transcoded posts
    if (!originalUrl) return null;
    if (data.postVideoURL_low && data.postVideoURL_low !== originalUrl) return null;

    const postId = context.params.postId;
    const tmpInput = path.join(os.tmpdir(), `${postId}_orig`);
    const tmpOutput = path.join(os.tmpdir(), `${postId}_low.mp4`);

    try {
      // 1. Download original video
      const response = await axios.get(originalUrl, { responseType: "arraybuffer", timeout: 120000 });
      fs.writeFileSync(tmpInput, Buffer.from(response.data));

      // 2. Transcode: max 480p, H.264 CRF-28, AAC 64k, web-optimised
      await new Promise((resolve, reject) => {
        ffmpeg(tmpInput)
          .videoFilter("scale='min(854,iw)':'min(480,ih)':force_original_aspect_ratio=decrease:flags=lanczos")
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

      // 3. Upload low.mp4 to Firebase Storage
      const bucket = admin.storage().bucket();
      const userId = data.postUser
        ? (typeof data.postUser === "string" ? data.postUser.split("/").pop() : data.postUser.id)
        : postId;
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

      // 4. Write back to Firestore
      await snap.ref.update({
        postVideoURL_low: lowUrl,
        postVideoURL: lowUrl,       // legacy field used by old clients
      });

      functions.logger.info(`transcodeVideoPost: done postId=${postId}`);
    } catch (err) {
      functions.logger.error(`transcodeVideoPost: failed postId=${postId}`, err);
      // Non-fatal — original video still works
    } finally {
      if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
      if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
    }

    return null;
  });

exports.onUserDeleted = functions
  .region("europe-central2")
  .auth.user()
  .onDelete(async (user) => {
    let firestore = admin.firestore();
    let userRef = firestore.doc("users/" + user.uid);
    await firestore.collection("users").doc(user.uid).delete();
  });
