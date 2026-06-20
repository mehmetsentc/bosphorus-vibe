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
  preview: string;
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

  return { original, preview, low, high, poster };
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

/** Smaller transcodes / previews — preferred for feed & reels playback. */
export function getFastPlaybackCandidates(post: UserPostDoc): string[] {
  const { original, preview, low, high } = getPostVideoVariants(post);
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

  const distinctHigh = high && high !== original && high !== distinctLow ? high : "";
  if (distinctHigh) {
    candidates.push(distinctHigh);
  }

  const transcodedHigh = inferTranscodedHighUrl(post);
  if (transcodedHigh && !candidates.includes(transcodedHigh)) {
    candidates.push(transcodedHigh);
  }

  return uniqueUrls(...candidates).filter((url) => url !== original);
}

/**
 * Reels fallback ladder — smallest → largest (used only on playback errors).
 */
export function getReelsPlaybackLadder(post: UserPostDoc): string[] {
  const { original, low, preview, high } = getPostVideoVariants(post);
  const fast = getFastPlaybackCandidates(post);

  const previews = fast.filter(
    (u) => u.includes("/preview.mp4") || (preview && u === preview),
  );
  const lows = fast.filter(
    (u) =>
      u.includes("/low.mp4") ||
      (low && u === low && u !== original),
  );
  const highs = fast.filter(
    (u) =>
      u.includes("/high.mp4") ||
      (high && u === high && u !== original),
  );

  return uniqueUrls(...previews, ...lows, ...highs, low, high, original);
}

/** Server FFmpeg finished — encoded tiers have +faststart (safe to play directly). */
export function isServerTranscodeReady(post: UserPostDoc): boolean {
  if (post.videoTranscodeStatus !== "done" || !post.id) return false;
  const marker = `/videos/${post.id}/`;
  const urls = [
    post.postVideoURL_low,
    post.postVideoURL_high,
    post.postVideoURL_preview,
  ].filter(Boolean);
  return urls.some((u) => u!.includes(marker));
}

/** Firestore-backed URLs only — tokenized, no inference (instant playback). */
export function getTrustedVideoUrls(post: UserPostDoc): {
  original: string;
  preview: string;
  low: string;
  high: string;
  primary: string;
} {
  const original =
    post.postVideoURL_original ||
    post.postVideo ||
    "";
  const preview = post.postVideoURL_preview || "";
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
    low,
    high,
    primary,
  };
}

type ReelsPlaybackOptions = {
  preferHighQuality?: boolean;
};

/**
 * Instant reels playback — encoded posts play 720p/1080p directly (+faststart).
 * Pre-encode posts use client preview until Cloud Function finishes.
 */
export function getReelsImmediatePlayback(
  post: UserPostDoc,
  tier: NetworkTier,
  options?: ReelsPlaybackOptions,
): { src: string; fallbacks: string[]; poster?: string } {
  const { original, preview, low, high, primary } = getTrustedVideoUrls(post);
  const poster = getPostVideoPoster(post);
  const preferHigh = options?.preferHighQuality === true;
  const encoded = isServerTranscodeReady(post);
  const ordered: string[] = [];

  if (encoded) {
    if (tier === "slow") {
      if (preview) ordered.push(preview);
      if (low) ordered.push(low);
      if (high) ordered.push(high);
    } else if (preferHigh) {
      if (high) ordered.push(high);
      if (low) ordered.push(low);
      if (preview) ordered.push(preview);
    } else {
      // Default: preview first for instant first-frame (IG/TikTok style)
      if (preview) ordered.push(preview);
      if (low) ordered.push(low);
      if (high) ordered.push(high);
    }
  } else {
    if (preview) ordered.push(preview);
    if (primary && !ordered.includes(primary)) ordered.push(primary);
    if (low && low !== original) ordered.push(low);
  }

  if (original && !ordered.includes(original)) ordered.push(original);

  if (!ordered.length) {
    ordered.push(...getReelsPlaybackLadder(post));
  } else {
    for (const url of getReelsPlaybackLadder(post)) {
      if (!ordered.includes(url)) ordered.push(url);
    }
  }

  const playable = uniqueUrls(...ordered).filter(Boolean);
  const src = pickPlayableSrc(playable) || playable[0] || "";
  const fallbacks = playable.filter((url) => url !== src);
  return { src, fallbacks, poster };
}

/** Lightweight prewarm — preview/low URL + leading bytes only (no extra decoders). */
export function getReelsPrewarmUrl(
  post: UserPostDoc,
  tier: NetworkTier,
): string {
  return getReelsImmediatePlayback(post, tier).src;
}

/** @deprecated Use getReelsImmediatePlayback — kept for ladder ordering */
export function getReelsStartIndex(
  urls: string[],
  tier: NetworkTier,
  original?: string,
): number {
  if (!urls.length) return 0;
  const previewIdx = urls.findIndex((u) => u.includes("/preview.mp4"));
  if (previewIdx >= 0) return previewIdx;
  if (tier === "slow") return 0;
  const lowIdx = urls.findIndex((u) => u.includes("/low.mp4"));
  if (lowIdx >= 0) return lowIdx;
  if (original) {
    const origIdx = urls.indexOf(original);
    if (origIdx >= 0) return origIdx;
  }
  return 0;
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

  // Separate preview (tiny, sub-480p) from higher-quality low.mp4
  const previews = fast.filter(
    (u) => u.includes("/preview.mp4") || u.includes("preview.mp4"),
  );
  const lows = fast.filter((u) => !previews.includes(u));

  let ordered: string[];
  if (context === "reels") {
    ordered = getReelsPlaybackLadder(post);
  } else if (context === "feed") {
    if (tier === "slow") {
      // Slow network: smallest first (preview → low → original)
      ordered = uniqueUrls(...lows, low, ...previews, original);
    } else if (tier === "fast") {
      // Fast network (WiFi/5G): original (720p+) first, low as fallback
      ordered = uniqueUrls(original, ...lows, low, ...previews);
    } else {
      // Normal network: low.mp4 (480p) first, original next, preview as last resort
      ordered = uniqueUrls(...lows, low, original, ...previews);
    }
  } else if (options?.preferHighQuality && original) {
    const { high: trustedHigh, low: trustedLow } = getTrustedVideoUrls(post);
    ordered = uniqueUrls(trustedHigh, trustedLow, ...fast, original);
  } else if (tier === "slow") {
    ordered = fast.length ? [...fast, original] : uniqueUrls(original, low);
  } else if (fast.length) {
    ordered = [...fast, original];
  } else {
    ordered = uniqueUrls(low, original);
  }

  const candidates = uniqueUrls(...ordered);
  const src = pickPlayableSrc(candidates);
  const fallbacks = candidates.filter((url) => url !== src);

  return { src, poster, fallbacks };
}

const prewarmedUrls = new Set<string>();
const prefetchedLeadBytes = new Set<string>();
const prewarmElements: HTMLVideoElement[] = [];
/** Hidden prewarm videos also consume iOS decoders — keep tiny. */
const MAX_PREWARM_ELEMENTS = 2;

/** Warm first ~512KB (moov + initial mdat) for faster first frame on +faststart MP4. */
export function prefetchVideoLeadingBytes(url: string): void {
  if (!url || typeof window === "undefined" || prefetchedLeadBytes.has(url)) return;
  prefetchedLeadBytes.add(url);
  void fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "force-cache",
    headers: { Range: "bytes=0-524287" },
  }).catch(() => {
    prefetchedLeadBytes.delete(url);
  });
}

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

/** Prewarm reels — leading bytes always; hidden <video> only when `withElement`. */
export function prewarmReelsPost(
  post: UserPostDoc,
  tier: NetworkTier,
  withElement = false,
): void {
  const src = getReelsPrewarmUrl(post, tier);
  const poster = getPostVideoPoster(post);
  if (src) {
    prefetchVideoLeadingBytes(src);
    if (withElement) prewarmVideoUrl(src);
  }
  if (poster) prefetchImageUrl(poster);
}

export function prewarmReelsPosts(
  posts: UserPostDoc[],
  tier: NetworkTier,
): void {
  posts.forEach((post, index) => {
    prewarmReelsPost(post, tier, index === 0);
  });
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
