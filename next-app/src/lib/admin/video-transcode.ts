export type VideoTranscodeStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "skipped";

export function getOriginalVideoUrl(data: Record<string, unknown>): string {
  const original =
    data.postVideoURL_original || data.postVideo || data.postVideoURL;
  return typeof original === "string" ? original : "";
}

/** True when Cloud Function has written users/{uid}/videos/{postId}/low.mp4 */
export function hasServerTranscodedLow(
  data: Record<string, unknown>,
  postId?: string,
): boolean {
  const low = data.postVideoURL_low;
  if (typeof low !== "string" || !low) return false;
  const original = getOriginalVideoUrl(data);
  if (low === original) return false;

  try {
    const pathname = decodeURIComponent(new URL(low).pathname);
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    const storagePath = encoded ? decodeURIComponent(encoded.split("?")[0] ?? encoded) : "";
    if (storagePath.includes("/videos/") && storagePath.endsWith("/low.mp4")) {
      if (!postId) return true;
      return storagePath.includes(`/videos/${postId}/low.mp4`);
    }
  } catch {
    // fall through
  }

  if (postId) return low.includes(`/videos/${postId}/`);
  return /\/videos\/[^/]+\/low\.mp4/i.test(low);
}

export function postNeedsVideoTranscode(data: Record<string, unknown>): boolean {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;

  const status = data.videoTranscodeStatus as VideoTranscodeStatus | undefined;
  if (status === "skipped") return false;
  if (status === "done") return false;

  return true;
}

export function videoTranscodeStatusForUpload(): VideoTranscodeStatus {
  return "pending";
}

export function getTranscodeBatchUrl(projectId: string): string {
  return `https://europe-central2-${projectId}.cloudfunctions.net/runVideoTranscodeBatch`;
}
