import type { Locale } from "@/i18n/detect";
import { getMessage } from "@/i18n/messages";

const IMAGE_LOW_MAX_WIDTH = 1280;
const IMAGE_LOW_QUALITY = 0.65;
const VIDEO_LOW_MAX_WIDTH = 640; // used for thumbnail sizing

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;  // 20 MB

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


function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
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

  // iOS Safari can be slow — 8 s timeout so upload never hangs forever
  await raceTimeout(
    new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Video metadata failed"));
    }),
    8000,
  );

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

export function isImageBlob(blob: Blob): boolean {
  if (blob.type.startsWith("image/")) return true;
  if (blob.type.startsWith("video/")) return false;
  return blob.size < 512 * 1024;
}

/** Tiny gray JPEG when frame capture fails — never upload video as thumb.jpg */
export async function createPlaceholderThumbnail(): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 4, 4);
  }
  return canvasToBlob(canvas, "image/jpeg", 0.6);
}

/** Capture a JPEG frame from a video file at the given time (seconds). */
export async function videoThumbnailAtTime(
  file: File,
  timeSeconds = 0.1,
): Promise<Blob> {
  const { video, objectUrl, width, height } = await loadVideoMetadata(file);
  try {
    const t = Math.max(0.05, Math.min(timeSeconds, Math.max(0.05, video.duration - 0.05)));
    video.currentTime = t;
    await raceTimeout(
      new Promise<void>((resolve) => { video.onseeked = () => resolve(); }),
      4000,
    ).catch(() => { /* capture whatever frame is ready */ });
    return await captureVideoFrame(video, width, height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Default cover — first usable frame (~0.1s, avoids black iOS frame at t=0). */
export async function videoThumbnailFromFile(file: File): Promise<Blob> {
  try {
    return await videoThumbnailAtTime(file, 0.1);
  } catch {
    return createPlaceholderThumbnail();
  }
}

/**
 * Lightweight playback preview (≈1 Mbps) via video.captureStream + MediaRecorder.
 * Runs in parallel with original upload so Reels can start quickly; Cloud Function
 * later replaces this with a proper FFmpeg transcode.
 */
export async function createPlaybackPreviewBlob(
  file: File,
  options?: { videoBitsPerSecond?: number; playbackRate?: number; maxDurationSec?: number },
): Promise<Blob | null> {
  if (typeof document === "undefined" || typeof MediaRecorder === "undefined") {
    return null;
  }

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = false;
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;

  try {
    await raceTimeout(
      new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("metadata"));
      }),
      8000,
    );

    const maxDuration = options?.maxDurationSec ?? 180;
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > maxDuration) {
      return null;
    }

    const captureStream = (
      video as HTMLVideoElement & { captureStream?: () => MediaStream }
    ).captureStream;
    if (!captureStream) return null;

    const stream = captureStream.call(video);
    if (!stream.getVideoTracks().length) return null;

    const mimeCandidates = [
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
      "video/mp4",
      'video/webm;codecs="vp9,opus"',
      "video/webm",
    ];
    const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m));
    if (!mimeType) return null;

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: options?.videoBitsPerSecond ?? 900_000,
      audioBitsPerSecond: 64_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const blobPromise = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType.split(";")[0] ?? "video/mp4" });
        if (blob.size < 8_000) reject(new Error("preview too small"));
        else resolve(blob);
      };
      recorder.onerror = () => reject(new Error("record failed"));
    });

    const rate = options?.playbackRate ?? 2;
    video.playbackRate = rate;
    recorder.start(500);
    await video.play();

    await raceTimeout(
      new Promise<void>((resolve) => {
        video.onended = () => resolve();
      }),
      Math.ceil((video.duration / rate) * 1000) + 20_000,
    );

    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    return await blobPromise;
  } catch {
    return null;
  } finally {
    video.pause();
    video.src = "";
    URL.revokeObjectURL(objectUrl);
  }
}

/** Thumbnail üret + orijinal videoyu döndür.
 *
 * Client-side video re-encoding kaldırıldı: canvas-based recorder ses kanalını
 * siliyordu (canvas captureStream → yalnızca görüntü). Orijinal dosya ses
 * korunarak yükleniyor; Cloud Function FFmpeg ile ses koruyan low-quality
 * versiyonu oluşturur ve postVideoURL_low'u günceller.
 */
export async function compressVideo(file: File): Promise<CompressedVideoResult> {
  let objectUrl = "";
  try {
    const loaded = await loadVideoMetadata(file);
    objectUrl = loaded.objectUrl;
    const { video, width, height } = loaded;

    video.currentTime = 0;
    // iOS: onseeked may never fire for t=0 — 3 s timeout fallback
    await raceTimeout(
      new Promise<void>((resolve) => { video.onseeked = () => resolve(); }),
      3000,
    ).catch(() => { /* timeout — capture whatever frame is ready */ });
    const thumbnail = await captureVideoFrame(video, width, height);
    return { video: file, thumbnail };
  } catch {
    const placeholder = await createPlaceholderThumbnail();
    return { video: file, thumbnail: placeholder };
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
