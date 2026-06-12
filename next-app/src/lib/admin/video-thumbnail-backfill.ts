import { isImageMediaUrl } from "@/lib/utils/video-sources";
import { getOriginalVideoUrl } from "@/lib/admin/video-transcode";

export type VideoThumbnailStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "skipped";

function getThumbnailUrl(data: Record<string, unknown>): string {
  const thumb = data.postVideothumbnail;
  return typeof thumb === "string" ? thumb : "";
}

function isBrokenThumbnail(data: Record<string, unknown>, originalUrl: string): boolean {
  const thumb = getThumbnailUrl(data);
  if (!thumb) return true;
  if (!isImageMediaUrl(thumb)) return true;
  if (thumb === originalUrl) return true;

  const video =
    (typeof data.postVideo === "string" && data.postVideo) ||
    (typeof data.postVideoURL === "string" && data.postVideoURL) ||
    "";
  if (thumb === video) return true;

  return false;
}

/** True when FFmpeg should regenerate postVideothumbnail from the video file. */
export function postNeedsThumbnailRegen(data: Record<string, unknown>): boolean {
  const originalUrl = getOriginalVideoUrl(data);
  if (!originalUrl) return false;

  const status = data.videoThumbnailStatus as VideoThumbnailStatus | undefined;
  if (status === "processing") return false;
  if (status === "skipped") return false;
  if (status === "done" && !isBrokenThumbnail(data, originalUrl)) return false;

  return isBrokenThumbnail(data, originalUrl);
}

export function getThumbnailBatchUrl(projectId: string): string {
  return `https://europe-central2-${projectId}.cloudfunctions.net/runVideoThumbnailBatch`;
}
