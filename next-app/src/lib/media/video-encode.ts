/**
 * Unified video encode profile — H.264 MP4 ladder (Instagram-style tiers).
 *
 * Client: instant preview.mp4 (MediaRecorder) beside original on upload.
 * Server: preview (540p) + feed (720p) + high (1080p) under users/{uid}/videos/{postId}/.
 */

export type VideoEncodeStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "skipped";

/** Long-lived cache for immutable encoded media (Firebase Storage + CDN edge). */
export const STORAGE_MEDIA_CACHE_CONTROL =
  "public, max-age=31536000, immutable";

/** Standard output container — H.264 MP4 with faststart (+faststart on every tier). */
export const VIDEO_ENCODE_PROFILE = {
  container: "mp4",
  videoCodec: "h264",
  /** Default when tier omits profile/level */
  profile: "main",
  level: "4.0",
  /** Client MediaRecorder — fast publish while server encodes */
  clientPreview: {
    videoBitsPerSecond: 1_200_000,
    audioBitsPerSecond: 64_000,
    playbackRate: 2,
    maxDurationSec: 180,
  },
  /** Server — fast start tier (540p, moov at front) */
  serverPreview: {
    maxWidth: 960,
    maxHeight: 540,
    crf: "25",
    preset: "veryfast",
    audioBitrate: "96k",
    profile: "main",
    level: "3.1",
  },
  /** Server — primary reels/feed quality (720p) */
  serverLow: {
    maxWidth: 1280,
    maxHeight: 720,
    crf: "23",
    preset: "fast",
    audioBitrate: "128k",
    profile: "main",
    level: "3.1",
  },
  /** Server — high quality (1080p, Wi‑Fi / user preference) */
  serverHigh: {
    maxWidth: 1920,
    maxHeight: 1080,
    crf: "22",
    preset: "fast",
    audioBitrate: "128k",
    profile: "main",
    level: "4.1",
  },
} as const;

export function standardEncodePaths(userId: string, postId: string) {
  const base = `users/${userId}/videos/${postId}`;
  return {
    base,
    preview: `${base}/preview.mp4`,
    low: `${base}/low.mp4`,
    high: `${base}/high.mp4`,
    thumb: `${base}/thumb.jpg`,
  };
}

export function uploadSessionPaths(userId: string, stamp: number | string) {
  const base = `users/${userId}/uploads/${stamp}`;
  return {
    base,
    original: (ext: string) => `${base}/original.${ext}`,
    preview: `${base}/preview.mp4`,
    thumb: `${base}/thumb.jpg`,
  };
}

export function buildFirebaseDownloadUrl(
  bucket: string,
  storagePath: string,
  token?: string,
): string {
  const t = token ?? "";
  const qs = t ? `?alt=media&token=${t}` : "?alt=media";
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}${qs}`;
}

export function decodeStoragePathFromDownloadUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    if (!encoded) return null;
    return decodeURIComponent(encoded.split("?")[0] ?? encoded);
  } catch {
    return null;
  }
}

export function videoEncodeStatusForUpload(): VideoEncodeStatus {
  return "pending";
}

/** True when URL points at a standardized server encode (not full original). */
export function isEncodedPlaybackUrl(url: string, postId?: string): boolean {
  if (!url) return false;
  if (url.includes("/preview.mp4")) return true;
  if (url.includes("/low.mp4")) return true;
  if (url.includes("/high.mp4")) return true;
  if (postId && url.includes(`/videos/${postId}/`)) return true;
  return false;
}
