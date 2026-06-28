import type { UserPostDoc } from "@/types";
import type { NetworkTier } from "@/lib/hooks/useNetworkQuality";
import { prefetchVideoLeadingBytesManaged } from "@/lib/performance/video-prefetch-manager";

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

/** Firebase download URLs include ?token= — required for private buckets. */
export function hasDownloadToken(url: string): boolean {
  if (!url) return false;
  try {
    return new URL(url).searchParams.has("token");
  } catch {
    return /[?&]token=/.test(url);
  }
}

/** Tokenized Firestore URLs first; guessed paths last. */
export function orderUrlsTokenizedFirst(urls: string[]): string[] {
  const withToken = urls.filter(hasDownloadToken);
  const without = urls.filter((u) => !hasDownloadToken(u));
  return uniqueUrls(...withToken, ...without);
}

/** True when URL path looks like a video file. */
export function isVideoMediaUrl(url: string): boolean {
  if (!url) return false;
  const ext = videoUrlExtension(url);
  if (!ext) return false;
  return VIDEO_URL_EXTENSIONS.has(ext);
}

/** Ordered poster/thumbnail candidates for feed (allows Firebase URLs without extension). */
export function getPostFeedThumbnailCandidates(post: UserPostDoc): string[] {
  return getRawPosterCandidates(post).filter((url) => !isVideoMediaUrl(url));
}

/** Ordered poster candidates for profile grid / thumbnails. */
export function getPostGridThumbnailCandidates(post: UserPostDoc): string[] {
  return getPostFeedThumbnailCandidates(post).filter(isImageMediaUrl);
}

/** Best poster/cover image for a video post (grid, feed, reels). */
export function getPostVideoPoster(post: UserPostDoc): string | undefined {
  return getPostFeedThumbnailCandidates(post)[0] ?? getRawPosterCandidates(post).find((u) => !isVideoMediaUrl(u));
}

export function getPostVideoVariants(post: UserPostDoc): {
  original: string;
  preview: string;
  medium: string;
  low: string;
  high: string;
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
  const medium = post.postVideoURL_medium || inferTranscodedMediumUrl(post) || "";
  const low =
    post.postVideoURL_low ||
    post.postVideoURL ||
    post.postVideo ||
    "";
  const high =
    (post.postVideoURL_high && post.postVideoURL_high !== original
      ? post.postVideoURL_high
      : "") || inferTranscodedHighUrl(post) || "";
  const poster = getPostVideoPoster(post);

  return { original, preview, medium, low, high, poster };
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

/** Server-encoded medium.mp4: users/{uid}/videos/{postId}/medium.mp4 (480p) */
export function inferTranscodedMediumUrl(post: UserPostDoc): string | undefined {
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

    const mediumPath = `users/${userId}/videos/${post.id}/medium.mp4`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(mediumPath)}?alt=media`;
  } catch {
    return undefined;
  }
}

/** Server-encoded high.mp4: users/{uid}/videos/{postId}/high.mp4 */
export function inferTranscodedHighUrl(post: UserPostDoc): string | undefined {
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

    const highPath = `users/${userId}/videos/${post.id}/high.mp4`;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(highPath)}?alt=media`;
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

/** Firestore-backed URLs only — tokenized, no inference (instant playback). */
export function getTrustedVideoUrls(post: UserPostDoc): {
  original: string;
  preview: string;
  medium: string;
  low: string;
  high: string;
  primary: string;
} {
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    "";
  const preview = post.postVideoURL_preview || "";
  const medium = post.postVideoURL_medium || "";
  const low =
    post.postVideoURL_low && post.postVideoURL_low !== original
      ? post.postVideoURL_low
      : "";
  const high =
    post.postVideoURL_high && post.postVideoURL_high !== original
      ? post.postVideoURL_high
      : "";
  const primary = post.postVideoURL || "";
  return {
    original: original || primary,
    preview,
    medium,
    low,
    high,
    primary,
  };
}

/** Canonical playable URL from Firestore — fallback when no tier list applies. */
export function getCanonicalVideoPlaybackUrl(post: UserPostDoc): string {
  return (
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    post.postVideoURL_low ||
    ""
  );
}

/**
 * Fast-flow ladder — smallest tokenized Firestore URL first (preview → low → … → original).
 * Used for feed, reels, and prewarm so playback starts on lightweight MP4s.
 */
export function getFastFlowPlaybackUrls(post: UserPostDoc): string[] {
  const { original, preview, medium, low, high, primary } = getTrustedVideoUrls(post);
  return orderUrlsTokenizedFirst(
    uniqueUrls(
      preview,
      low,
      medium,
      high,
      primary,
      post.postVideoURL_preview,
      post.postVideoURL_low,
      post.postVideoURL_medium,
      post.postVideoURL_high,
      post.postVideoURL,
      post.postVideoURL_original,
      post.postVideo,
      original,
    ).filter((u) => u && !isImageMediaUrl(u)),
  );
}

export function getFastFlowPlaybackUrl(post: UserPostDoc): string {
  const urls = getFastFlowPlaybackUrls(post);
  return pickPlayableSrc(urls) || getCanonicalVideoPlaybackUrl(post);
}

export type VideoPlaybackContext = "feed" | "detail" | "reels";

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
  _tier: NetworkTier,
  context: VideoPlaybackContext = "feed",
  options?: PickVideoSourceOptions,
): { src: string; poster?: string; fallbacks: string[] } {
  const poster = getPostVideoPoster(post);
  const urls = getFastFlowPlaybackUrls(post);
  const original = getCanonicalVideoPlaybackUrl(post);

  let ordered: string[];
  if (options?.preferHighQuality && original && context === "detail") {
    ordered = uniqueUrls(original, ...urls);
  } else {
    ordered = urls;
  }

  const src = pickPlayableSrc(ordered) || original;
  return { src, poster, fallbacks: ordered.filter((url) => url !== src) };
}

const prefetchedImages = new Set<string>();
const MAX_PREFETCH_IMAGES = 48;

/** Warm first ~512KB (moov + initial mdat) for faster first frame on +faststart MP4. */
export function prefetchVideoLeadingBytes(url: string, postId?: string): void {
  prefetchVideoLeadingBytesManaged(url, postId);
}

/** Warm poster/thumbnail HTTP cache for faster LCP. */
export function prefetchImageUrl(url: string): void {
  if (!url || typeof document === "undefined" || prefetchedImages.has(url)) return;
  if (prefetchedImages.size >= MAX_PREFETCH_IMAGES) return;
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

/** Prewarm next clip — first 512KB only (no extra decoders or full downloads). */
export function prewarmReelsPost(post: UserPostDoc, _tier: NetworkTier): void {
  const src = getFastFlowPlaybackUrl(post);
  const poster = getPostVideoPoster(post);
  if (src) prefetchVideoLeadingBytes(src, post.id);
  if (poster) prefetchImageUrl(poster);
}

export function prewarmReelsPosts(posts: UserPostDoc[], tier: NetworkTier): void {
  for (const post of posts) {
    prewarmReelsPost(post, tier);
  }
}

/**
 * Returns the best image URL for a given context.
 */
export function pickImageSource(
  post: UserPostDoc,
  context: "feed" | "grid" | "detail" = "feed",
): string {
  const candidates = uniqueUrls(
    post.postPhotoURL_low,
    post.postPhotoURL,
    post.postPhoto,
    post.postPhotoURL_original,
  );

  if (context === "detail") {
    return candidates.find((u) => u.includes("_original") || u === post.postPhotoURL_original) || candidates[0] || "";
  }
  return candidates[0] || "";
}

/** Fallback chain for feed photo posts. */
export function getPostFeedImageCandidates(post: UserPostDoc): string[] {
  return uniqueUrls(
    post.postPhotoURL_low,
    post.postPhotoURL,
    post.postPhoto,
    post.postPhotoURL_original,
  );
}

export function hasPostVideo(post: UserPostDoc): boolean {
  return uniqueUrls(
    post.postVideoURL_original,
    post.postVideoURL_low,
    post.postVideoURL_preview,
    post.postVideoURL_medium,
    post.postVideoURL_high,
    post.postVideoURL,
    post.postVideo,
  ).length > 0;
}

/** Guess thumb.jpg beside original.mov/mp4 in Firebase Storage URLs. */
export function inferThumbUrlFromVideo(videoUrl: string): string | undefined {
  return inferSiblingAssetUrl(videoUrl, "thumb.jpg");
}
