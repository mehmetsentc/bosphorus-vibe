/**
 * Server-side video encode profile — mirrors next-app/src/lib/media/video-encode.ts
 */

const VIDEO_ENCODE_PROFILE = {
  container: "mp4",
  videoCodec: "h264",
  profile: "baseline",
  level: "3.0",
  serverPreview: {
    maxWidth: 854,
    maxHeight: 480,
    crf: "28",
    preset: "veryfast",
    audioBitrate: "64k",
  },
  serverLow: {
    maxWidth: 1280,
    maxHeight: 720,
    crf: "26",
    preset: "fast",
    audioBitrate: "96k",
  },
};

function standardEncodePaths(userId, postId) {
  const base = `users/${userId}/videos/${postId}`;
  return {
    base,
    preview: `${base}/preview.mp4`,
    low: `${base}/low.mp4`,
    thumb: `${base}/thumb.jpg`,
  };
}

function buildFirebaseDownloadUrl(bucket, storagePath, token) {
  return (
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/` +
    `${encodeURIComponent(storagePath)}?alt=media&token=${token}`
  );
}

function scaleFilter(maxW, maxH) {
  return `scale='min(${maxW},iw)':'min(${maxH},ih)':force_original_aspect_ratio=decrease:flags=lanczos`;
}

/**
 * @param {import('fluent-ffmpeg').FfmpegCommand} command
 */
function applyH264Profile(command, tier) {
  return command
    .videoFilter(scaleFilter(tier.maxWidth, tier.maxHeight))
    .videoCodec("libx264")
    .addOption("-crf", tier.crf)
    .addOption("-preset", tier.preset)
    .addOption("-profile:v", VIDEO_ENCODE_PROFILE.profile)
    .addOption("-level", VIDEO_ENCODE_PROFILE.level)
    .audioCodec("aac")
    .audioBitrate(tier.audioBitrate)
    .addOption("-movflags", "+faststart")
    .format(VIDEO_ENCODE_PROFILE.container);
}

function runFfmpeg(inputPath, outputPath, tier) {
  const ffmpeg = require("fluent-ffmpeg");
  return new Promise((resolve, reject) => {
    applyH264Profile(ffmpeg(inputPath), tier)
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

module.exports = {
  VIDEO_ENCODE_PROFILE,
  standardEncodePaths,
  buildFirebaseDownloadUrl,
  runFfmpegEncode: runFfmpeg,
};
