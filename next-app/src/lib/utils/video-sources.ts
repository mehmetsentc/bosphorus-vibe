import type { UserPostDoc } from "@/types";
import type { NetworkTier } from "@/lib/hooks/useNetworkQuality";

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
  low: string;
  poster?: string;
} {
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
  const poster = getPostVideoPoster(post);

  return { original, low, poster };
}

/** Guess sibling asset beside original.mov/mp4 in Firebase Storage URLs. */
function inferSiblingAssetUrl(
  videoUrl: string,
  filename: string,
): string | undefined {
  if (!videoUrl || !/original\.[a-z0-9]+/i.test(videoUrl)) return undefined;
  return videoUrl.replace(/original\.[a-z0-9]+/i, filename);
}

/** Client-uploaded preview.mp4 beside original — smallest, fastest start. */
export function inferPreviewUrlFromVideo(videoUrl: string): string | undefined {
  return inferSiblingAssetUrl(videoUrl, "preview.mp4");
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

/** Smaller transcodes / previews — preferred for feed & reels playback. */
export function getFastPlaybackCandidates(post: UserPostDoc): string[] {
  const { original, low } = getPostVideoVariants(post);
  const distinctLow = low && original && low !== original ? low : "";

  const candidates: string[] = [];

  if (distinctLow) {
    candidates.push(distinctLow);
  }

  const preview = inferPreviewUrlFromVideo(original);
  if (preview && preview !== distinctLow) {
    candidates.push(preview);
  }

  // Server transcode path — only when we know the file exists
  if (post.videoTranscodeStatus === "done") {
    const transcoded = inferTranscodedLowUrl(post);
    if (transcoded && transcoded !== distinctLow) {
      candidates.push(transcoded);
    }
  }

  return uniqueUrls(...candidates).filter((url) => url !== original);
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
    // Reels: always preview/low first — instant start beats full-res on swipe
    ordered = fast.length ? [...fast, original] : uniqueUrls(original, low);
  } else if (options?.preferHighQuality && original) {
    ordered = fast.length ? [original, ...fast] : uniqueUrls(original, low);
  } else if (context === "feed" || tier === "slow") {
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
const MAX_PREWARM_ELEMENTS = 12;

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
    prewarmElements.shift()?.remove();
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
  if (src) prewarmVideoUrl(src);
  if (fallbacks[0]) prewarmVideoUrl(fallbacks[0]);
  if (poster) prefetchImageUrl(poster);
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
