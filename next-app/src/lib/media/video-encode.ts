/**
 * Unified video encode profile — all uploads target the same H.264 MP4 ladder.
 *
 * Client: instant preview.mp4 (MediaRecorder) beside original on upload.
 * Server: FFmpeg preview.mp4 + low.mp4 under users/{uid}/videos/{postId}/.
 */

export type VideoEncodeStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "skipped";

/** Standard output container — H.264 baseline MP4 with faststart. */
export const VIDEO_ENCODE_PROFILE = {
  container: "mp4",
  videoCodec: "h264",
  profile: "baseline",
  level: "3.0",
  /** Client MediaRecorder — smallest, fastest publish */
  clientPreview: {
    videoBitsPerSecond: 650_000,
    audioBitsPerSecond: 48_000,
    playbackRate: 2,
    maxDurationSec: 180,
  },
  /** Server FFmpeg — instant playback tier */
  serverPreview: {
    maxWidth: 640,
    maxHeight: 360,
    crf: "30",
    preset: "veryfast",
    audioBitrate: "64k",
  },
  /** Server FFmpeg — feed/reels quality tier */
  serverLow: {
    maxWidth: 854,
    maxHeight: 480,
    crf: "28",
    preset: "fast",
    audioBitrate: "64k",
  },
} as const;

export function standardEncodePaths(userId: string, postId: string) {
  const base = `users/${userId}/videos/${postId}`;
  return {
    base,
    preview: `${base}/preview.mp4`,
    low: `${base}/low.mp4`,
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
  if (postId && url.includes(`/videos/${postId}/`)) return true;
  return false;
}
