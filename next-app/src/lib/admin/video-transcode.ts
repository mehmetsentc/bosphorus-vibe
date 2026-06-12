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

export function postNeedsVideoTranscode(data: Record<string, unknown>): boolean {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;

  const status = data.videoTranscodeStatus as VideoTranscodeStatus | undefined;
  if (status === "done" || status === "skipped") return false;

  const low = data.postVideoURL_low;
  if (typeof low === "string" && low && low !== originalUrl) return false;

  return true;
}

export function videoTranscodeStatusForUpload(
  originalUrl: string,
  lowUrl: string,
): VideoTranscodeStatus {
  return lowUrl && lowUrl !== originalUrl ? "done" : "pending";
}

export function getTranscodeBatchUrl(projectId: string): string {
  return `https://europe-central2-${projectId}.cloudfunctions.net/runVideoTranscodeBatch`;
}
