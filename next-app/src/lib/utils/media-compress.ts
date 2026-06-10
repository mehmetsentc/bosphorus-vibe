import type { Locale } from "@/i18n/detect";
import { getMessage } from "@/i18n/messages";

const IMAGE_LOW_MAX_WIDTH = 1280;
const IMAGE_LOW_QUALITY = 0.65;
const VIDEO_LOW_MAX_WIDTH = 640;
const VIDEO_LOW_BITRATE = 750_000;
const VIDEO_RECORD_FPS = 24;

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;  // 50 MB

const VIDEO_EXTENSIONS = new Set([
  "mov",
  "mp4",
  "webm",
  "m4v",
  "avi",
  "mkv",
  "quicktime",
]);
const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
]);

function fileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return VIDEO_EXTENSIONS.has(fileExtension(file));
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXTENSIONS.has(fileExtension(file));
}

export type CompressedVideoResult = {
  video: Blob;
  thumbnail: Blob;
};

export function validateMediaSize(file: File, locale: Locale = "en"): string | null {
  const isVideo = isVideoFile(file);
  const isImage = isImageFile(file);
  if (!isVideo && !isImage) return getMessage(locale, "mediaTypeError");
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return getMessage(locale, "videoSizeError");
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return getMessage(locale, "imageSizeError");
  }
  return null;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Blob export failed"));
      },
      type,
      quality,
    );
  });
}

function pickRecorderMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
}

async function loadVideoMetadata(file: File): Promise<{
  video: HTMLVideoElement;
  objectUrl: string;
  width: number;
  height: number;
}> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = objectUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Video metadata failed"));
  });

  const scale = Math.min(1, VIDEO_LOW_MAX_WIDTH / (video.videoWidth || 640));
  const width = Math.max(2, Math.round((video.videoWidth || 640) * scale));
  const height = Math.max(2, Math.round((video.videoHeight || 360) * scale));

  return { video, objectUrl, width, height };
}

async function captureVideoFrame(
  video: HTMLVideoElement,
  width: number,
  height: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(video, 0, 0, width, height);
  return canvasToBlob(canvas, "image/jpeg", IMAGE_LOW_QUALITY);
}

async function reencodeVideoAtLowQuality(
  video: HTMLVideoElement,
  width: number,
  height: number,
): Promise<Blob> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder unavailable");
  }

  const mimeType = pickRecorderMimeType();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const stream = canvas.captureStream(VIDEO_RECORD_FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: VIDEO_LOW_BITRATE,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const recorded = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const type = mimeType.split(";")[0] ?? "video/webm";
      const blob = new Blob(chunks, { type });
      if (blob.size > 1024) resolve(blob);
      else reject(new Error("Empty recording"));
    };
    recorder.onerror = () => reject(new Error("Recording failed"));
  });

  recorder.start(250);
  video.currentTime = 0;
  await video.play();

  await new Promise<void>((resolve) => {
    const tick = () => {
      if (video.ended || video.currentTime >= video.duration - 0.05) {
        video.pause();
        if (recorder.state === "recording") recorder.stop();
        resolve();
        return;
      }
      ctx.drawImage(video, 0, 0, width, height);
      requestAnimationFrame(tick);
    };
    tick();
  });

  return recorded;
}

/** İlk kare JPEG poster */
export async function videoThumbnailFromFile(file: File): Promise<Blob> {
  const { video, objectUrl, width, height } = await loadVideoMetadata(file);
  try {
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    return await captureVideoFrame(video, width, height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Orijinal + düşük bitrate WebM + poster JPEG */
export async function compressVideo(file: File): Promise<CompressedVideoResult> {
  let objectUrl = "";
  try {
    const loaded = await loadVideoMetadata(file);
    objectUrl = loaded.objectUrl;
    const { video, width, height } = loaded;

    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    const thumbnail = await captureVideoFrame(video, width, height);

    try {
      const lowVideo = await reencodeVideoAtLowQuality(video, width, height);
      return { video: lowVideo, thumbnail };
    } catch {
      return { video: file, thumbnail };
    }
  } catch {
    const thumbnail = await videoThumbnailFromFile(file).catch(() => file);
    return { video: file, thumbnail };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function compressImage(file: File, locale: Locale = "en"): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_LOW_MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(getMessage(locale, "imageProcessError"));
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvasToBlob(canvas, "image/jpeg", IMAGE_LOW_QUALITY);
}
