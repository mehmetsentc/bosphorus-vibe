import type { UserPostDoc } from "@/types";
import type { NetworkTier } from "@/lib/hooks/useNetworkQuality";
import { warmVideoBlobs } from "@/lib/utils/video-blob-cache";
import { filterExistingVideoUrls } from "@/lib/utils/video-url-probe";

function uniqueUrls(...urls: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

export function isSafariOrIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("CriOS"))
  );
}

function videoUrlExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]+)$/);
    return match?.[1] ?? "";
  } catch {
    const match = url.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/);
    return match?.[1] ?? "";
  }
}

/** iOS Safari cannot play WebM; prefer MP4/MOV when available. */
export function isSafariPlayableVideoUrl(url: string): boolean {
  const ext = videoUrlExtension(url);
  if (!ext) return true;
  if (ext === "webm") return !isSafariOrIOS();
  return true;
}

function pickPlayableSrc(candidates: string[]): string {
  const unique = uniqueUrls(...candidates);
  if (!unique.length) return "";
  if (isSafariOrIOS()) {
    return unique.find(isSafariPlayableVideoUrl) ?? unique[0];
  }
  return unique[0];
}

const VIDEO_URL_EXTENSIONS = new Set([
  "mov",
  "mp4",
  "webm",
  "m4v",
  "avi",
  "mkv",
  "m4a",
]);

const IMAGE_URL_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
]);

/** True when URL path looks like an image (not a video file). */
export function isImageMediaUrl(url: string): boolean {
  if (!url) return false;
  const ext = videoUrlExtension(url);
  if (!ext) return true;
  if (VIDEO_URL_EXTENSIONS.has(ext)) return false;
  return IMAGE_URL_EXTENSIONS.has(ext);
}

function getRawPosterCandidates(post: UserPostDoc): string[] {
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    "";
  const low =
    post.postVideoURL_low ||
    post.postVideoURL ||
    post.postVideo ||
    "";
  return uniqueUrls(
    post.postVideothumbnail,
    post.postPhotoURL,
    post.postPhoto,
    inferThumbUrlFromVideo(original),
    inferThumbUrlFromVideo(low),
    pickImageSource(post, "grid"),
  );
}

/** Ordered poster candidates for profile grid / thumbnails. */
export function getPostGridThumbnailCandidates(post: UserPostDoc): string[] {
  return getRawPosterCandidates(post).filter(isImageMediaUrl);
}

/** Best poster/cover image for a video post (grid, feed, reels). */
export function getPostVideoPoster(post: UserPostDoc): string | undefined {
  return getPostGridThumbnailCandidates(post)[0];
}

export function getPostVideoVariants(post: UserPostDoc): {
  original: string;
  preview: string;
  low: string;
  poster?: string;
} {
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    "";
  const preview =
    post.postVideoURL_preview ||
    inferPreviewUrlFromVideo(original) ||
    "";
  const low =
    post.postVideoURL_low ||
    post.postVideoURL ||
    post.postVideo ||
    "";
  const poster = getPostVideoPoster(post);

  return { original, preview, low, poster };
}

/** Guess sibling asset beside original.mov/mp4 in Firebase Storage URLs. */
function inferSiblingAssetUrl(
  videoUrl: string,
  filename: string,
): string | undefined {
  if (!videoUrl || !/original\.[a-z0-9]+/i.test(videoUrl)) return undefined;
  return videoUrl.replace(/original\.[a-z0-9]+/i, filename);
}

/** Activity uploads: users/.../activities/{id}/low.mp4 beside original.mov */
export function inferActivityLowUrl(videoUrl: string): string | undefined {
  if (!videoUrl.includes("/activities/")) return undefined;
  const lowMp4 = inferSiblingAssetUrl(videoUrl, "low.mp4");
  if (lowMp4) return lowMp4;
  const m = videoUrl.match(/original\.([a-z0-9]+)/i);
  if (m) return videoUrl.replace(/original\.[a-z0-9]+/i, `low.${m[1]}`);
  return undefined;
}

/** Client-uploaded preview.mp4 beside original — smallest, fastest start. */
export function inferPreviewUrlFromVideo(videoUrl: string): string | undefined {
  const fromOriginal = inferSiblingAssetUrl(videoUrl, "preview.mp4");
  if (fromOriginal) return fromOriginal;

  try {
    const pathname = new URL(videoUrl).pathname;
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    if (!encoded) return undefined;
    const storagePath = decodeURIComponent(encoded.split("?")[0] ?? encoded);
    if (storagePath.endsWith("/preview.mp4")) return videoUrl;

    const previewPath = storagePath.replace(/\/[^/]+$/, "/preview.mp4");
    if (previewPath === storagePath) return undefined;

    const bucket = videoUrl.match(/\/v0\/b\/([^/]+)\//)?.[1];
    if (!bucket) return undefined;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(previewPath)}?alt=media`;
  } catch {
    return undefined;
  }
}

/** Upload-time low.mp4 beside original (before Cloud Function transcode). */
export function inferUploadLowUrlFromVideo(videoUrl: string): string | undefined {
  return inferSiblingAssetUrl(videoUrl, "low.mp4");
}

/**
 * Cloud Function transcode path: users/{uid}/videos/{postId}/low.mp4
 * Used when Firestore still points low === original.
 */
export function inferTranscodedLowUrl(post: UserPostDoc): string | undefined {
  if (!post.id) return undefined;
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    "";
  if (!original) return undefined;

  try {
    const bucket = original.match(/\/v0\/b\/([^/]+)\//)?.[1];
    if (!bucket) return undefined;

    const pathname = new URL(original).pathname;
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    const storagePath = encoded
      ? decodeURIComponent(encoded.split("?")[0] ?? encoded)
      : "";
    const userId =
      post.postUserId ||
      storagePath.match(/^users\/([^/]+)\//)?.[1] ||
      "";
    if (!userId) return undefined;

    const lowPath = `users/${userId}/videos/${post.id}/low.mp4`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(lowPath)}?alt=media`;
  } catch {
    return undefined;
  }
}

/** Server-encoded preview.mp4: users/{uid}/videos/{postId}/preview.mp4 */
export function inferTranscodedPreviewUrl(post: UserPostDoc): string | undefined {
  if (!post.id) return undefined;
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    "";
  if (!original) return undefined;

  try {
    const bucket = original.match(/\/v0\/b\/([^/]+)\//)?.[1];
    if (!bucket) return undefined;

    const userId =
      post.postUserId ||
      decodeStoragePathFromUrl(original)?.match(/^users\/([^/]+)\//)?.[1] ||
      "";
    if (!userId) return undefined;

    const previewPath = `users/${userId}/videos/${post.id}/preview.mp4`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(previewPath)}?alt=media`;
  } catch {
    return undefined;
  }
}

function decodeStoragePathFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const encoded = pathname.match(/\/o\/(.+)/)?.[1];
    if (!encoded) return null;
    return decodeURIComponent(encoded.split("?")[0] ?? encoded);
  } catch {
    return null;
  }
}

/** Smaller transcodes / previews — preferred for feed & reels playback. */
export function getFastPlaybackCandidates(post: UserPostDoc): string[] {
  const { original, preview, low } = getPostVideoVariants(post);
  const candidates: string[] = [];

  const distinctPreview =
    preview && preview !== original ? preview : "";
  if (distinctPreview) {
    candidates.push(distinctPreview);
  }

  const uploadPreview = inferPreviewUrlFromVideo(original);
  if (uploadPreview && uploadPreview !== distinctPreview) {
    candidates.push(uploadPreview);
  }

  const serverPreview = inferTranscodedPreviewUrl(post);
  if (serverPreview && !candidates.includes(serverPreview)) {
    candidates.push(serverPreview);
  }

  const distinctLow = low && low !== original && low !== distinctPreview ? low : "";
  if (distinctLow) {
    candidates.push(distinctLow);
  }

  const activityLow = inferActivityLowUrl(original);
  if (activityLow && !candidates.includes(activityLow)) {
    candidates.push(activityLow);
  }

  const transcodedLow = inferTranscodedLowUrl(post);
  if (transcodedLow && !candidates.includes(transcodedLow)) {
    candidates.push(transcodedLow);
  }

  return uniqueUrls(...candidates).filter((url) => url !== original);
}

/**
 * Reels fallback ladder — smallest → largest (used only on playback errors).
 */
export function getReelsPlaybackLadder(post: UserPostDoc): string[] {
  const { original, low, preview } = getPostVideoVariants(post);
  const fast = getFastPlaybackCandidates(post);

  const previews = fast.filter(
    (u) => u.includes("/preview.mp4") || (preview && u === preview),
  );
  const lows = fast.filter(
    (u) =>
      u.includes("/low.mp4") ||
      (low && u === low && u !== original),
  );

  return uniqueUrls(...previews, ...lows, low, original);
}

/** Stable start URL for reels — no mid-play src swaps (avoids restart loops). */
export function getReelsStartIndex(
  urls: string[],
  tier: NetworkTier,
  original?: string,
): number {
  if (!urls.length) return 0;
  if (tier === "slow") return 0;

  const lowIdx = urls.findIndex((u) => u.includes("/low.mp4"));
  if (lowIdx >= 0) return lowIdx;

  if (original) {
    const origIdx = urls.indexOf(original);
    if (origIdx >= 0) return origIdx;
  }

  return urls.length - 1;
}

export type VideoPlaybackContext = "feed" | "detail" | "reels";

export function hasDistinctLowQuality(post: UserPostDoc): boolean {
  const { original, low } = getPostVideoVariants(post);
  return Boolean(low && original && low !== original);
}

type PickVideoSourceOptions = {
  /** User chose "Yüksek kalite" in settings — prefer original when available. */
  preferHighQuality?: boolean;
};

/**
 * Returns the best video URL for the given context.
 *
 * - `"feed"` / slow network / auto → low quality first (faster start)
 * - `"detail"` + fast + high quality setting → original first
 * - Otherwise low first when a distinct low.mp4 exists (Cloud Function transcode)
 *
 * On iOS/Safari, skips WebM when an MP4/MOV alternative exists.
 */
export function pickVideoSource(
  post: UserPostDoc,
  tier: NetworkTier,
  context: VideoPlaybackContext = "feed",
  options?: PickVideoSourceOptions,
): { src: string; poster?: string; fallbacks: string[] } {
  const { original, low, poster } = getPostVideoVariants(post);
  const fast = getFastPlaybackCandidates(post);

  let ordered: string[];
  if (context === "reels") {
    ordered = getReelsPlaybackLadder(post);
  } else if (context === "feed") {
    ordered = fast.length ? [...fast, original] : uniqueUrls(original, low);
  } else if (options?.preferHighQuality && original) {
    ordered = fast.length ? [original, ...fast] : uniqueUrls(original, low);
  } else if (tier === "slow") {
    ordered = fast.length ? [...fast, original] : uniqueUrls(original, low);
  } else if (fast.length) {
    ordered = [original, ...fast];
  } else {
    ordered = uniqueUrls(low, original);
  }

  const candidates = uniqueUrls(...ordered);
  const src = pickPlayableSrc(candidates);
  const fallbacks = candidates.filter((url) => url !== src);

  return { src, poster, fallbacks };
}

const prewarmedUrls = new Set<string>();
const prewarmElements: HTMLVideoElement[] = [];
/** Hidden prewarm videos also consume iOS decoders — keep tiny. */
const MAX_PREWARM_ELEMENTS = 3;

function disposePrewarmVideo(video: HTMLVideoElement): void {
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.remove();
}

/** Hint the browser to fetch the next clip (desktop / Android). */
export function prefetchVideoUrl(url: string): void {
  if (!url || typeof document === "undefined") return;
  const existing = document.querySelector(
    `link[rel="prefetch"][as="video"][href="${CSS.escape(url)}"]`,
  );
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "video";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Warm the HTTP cache via a hidden <video> — iOS Safari ignores link prefetch.
 */
export function prewarmVideoUrl(url: string): void {
  if (!url || typeof document === "undefined" || prewarmedUrls.has(url)) return;
  prewarmedUrls.add(url);
  prefetchVideoUrl(url);

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.src = url;
  video.style.cssText =
    "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px";
  document.body.appendChild(video);
  video.load();

  prewarmElements.push(video);
  while (prewarmElements.length > MAX_PREWARM_ELEMENTS) {
    const old = prewarmElements.shift();
    if (old) disposePrewarmVideo(old);
  }
}

export function prewarmVideoUrls(urls: string[]): void {
  for (const url of urls) prewarmVideoUrl(url);
}

const prefetchedImages = new Set<string>();

/** Warm poster/thumbnail HTTP cache for faster LCP. */
export function prefetchImageUrl(url: string): void {
  if (!url || typeof document === "undefined" || prefetchedImages.has(url)) return;
  prefetchedImages.add(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}

export function prefetchImageUrls(urls: string[]): void {
  for (const url of urls) prefetchImageUrl(url);
}

/** Full-screen reels flow for a feed video (Instagram-style). */
export function getVideoReelsPath(postId: string): string {
  return `/feed/${postId}`;
}

/** Warm video + poster before opening reels from feed tap. */
export function prewarmPostVideo(
  post: UserPostDoc,
  tier: NetworkTier,
  context: VideoPlaybackContext = "feed",
): void {
  const { src, poster } = pickVideoSource(post, tier, context);
  if (src) prewarmVideoUrl(src);
  if (poster) prefetchImageUrl(poster);
}

/** Prewarm reels playback URL + poster for the next slides. */
export function prewarmReelsPost(post: UserPostDoc, tier: NetworkTier): void {
  const { src, poster, fallbacks } = pickVideoSource(post, tier, "reels");
  const candidates = [src, ...fallbacks].filter(Boolean).slice(0, 3);
  warmVideoBlobs(candidates, "high");
  if (poster) prefetchImageUrl(poster);

  void filterExistingVideoUrls(candidates).then((verified) => {
    if (verified[0]) warmVideoBlobs([verified[0]], "high");
  });
}

export function prewarmReelsPosts(posts: UserPostDoc[], tier: NetworkTier): void {
  for (const post of posts) prewarmReelsPost(post, tier);
}

/**
 * Returns the best image URL for a given context.
 */
export function pickImageSource(
  post: UserPostDoc,
  context: "feed" | "grid" | "detail" = "feed",
): string {
  const low =
    post.postPhotoURL_low ||
    post.postPhotoURL ||
    post.postPhoto ||
    "";
  const original =
    post.postPhotoURL_original ||
    post.postPhoto ||
    post.postPhotoURL ||
    "";

  if (context === "detail") return original || low;
  return low || original;
}

export function hasPostVideo(post: UserPostDoc): boolean {
  return uniqueUrls(
    post.postVideoURL_original,
    post.postVideoURL_low,
    post.postVideoURL,
    post.postVideo,
  ).length > 0;
}

/** Guess thumb.jpg beside original.mov/mp4 in Firebase Storage URLs. */
export function inferThumbUrlFromVideo(videoUrl: string): string | undefined {
  return inferSiblingAssetUrl(videoUrl, "thumb.jpg");
}

/** Best video URL for grid frame fallback (iOS-safe). */
export function pickGridVideoPreviewUrl(post: UserPostDoc): string {
  const { original, low } = getPostVideoVariants(post);
  return pickPlayableSrc([original, low]);
}
