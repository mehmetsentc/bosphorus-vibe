/**
 * Server-side video encode profile — mirrors next-app/src/lib/media/video-encode.ts
 */

const VIDEO_ENCODE_PROFILE = {
  container: "mp4",
  videoCodec: "h264",
  profile: "main",
  level: "4.0",
  serverPreview: {
    maxWidth: 960,
    maxHeight: 540,
    crf: "25",
    preset: "veryfast",
    audioBitrate: "96k",
    profile: "main",
    level: "3.1",
  },
  serverMedium: {
    maxWidth: 854,
    maxHeight: 480,
    crf: "24",
    preset: "fast",
    audioBitrate: "96k",
    profile: "main",
    level: "3.0",
  },
  serverLow: {
    maxWidth: 1280,
    maxHeight: 720,
    crf: "23",
    preset: "fast",
    audioBitrate: "128k",
    profile: "main",
    level: "3.1",
  },
  serverHigh: {
    maxWidth: 1920,
    maxHeight: 1080,
    crf: "22",
    preset: "fast",
    audioBitrate: "128k",
    profile: "main",
    level: "4.1",
  },
};

function standardEncodePaths(userId, postId) {
  const base = `users/${userId}/videos/${postId}`;
  return {
    base,
    preview: `${base}/preview.mp4`,
    medium: `${base}/medium.mp4`,
    low: `${base}/low.mp4`,
    high: `${base}/high.mp4`,
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
  const profile = tier.profile || VIDEO_ENCODE_PROFILE.profile;
  const level = tier.level || VIDEO_ENCODE_PROFILE.level;
  return command
    .videoFilter(scaleFilter(tier.maxWidth, tier.maxHeight))
    .videoCodec("libx264")
    .addOption("-crf", tier.crf)
    .addOption("-preset", tier.preset)
    .addOption("-profile:v", profile)
    .addOption("-level", level)
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
