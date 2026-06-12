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
  const poster =
    post.postVideothumbnail || post.postPhotoURL || post.postPhoto || undefined;

  return { original, low, poster };
}

/**
 * Returns the best video URL for the given context.
 *
 * - `"feed"` → low quality first (fast scroll)
 * - `"detail"` → tier-aware: slow=low, fast=original
 *
 * On iOS/Safari, skips WebM when an MP4/MOV alternative exists.
 */
export function pickVideoSource(
  post: UserPostDoc,
  tier: NetworkTier,
  context: "feed" | "detail" = "feed",
): { src: string; poster?: string; fallbacks: string[] } {
  const { original, low, poster } = getPostVideoVariants(post);

  let ordered: string[];
  if (context === "feed") {
    ordered = [low, original];
  } else if (tier === "slow") {
    ordered = [low, original];
  } else {
    ordered = [original, low];
  }

  const candidates = uniqueUrls(...ordered);
  const src = pickPlayableSrc(candidates);
  const fallbacks = candidates.filter((url) => url !== src);

  return { src, poster, fallbacks };
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
  if (!videoUrl || !/original\.[a-z0-9]+/i.test(videoUrl)) return undefined;
  return videoUrl.replace(/original\.[a-z0-9]+/i, "thumb.jpg");
}

/** Ordered poster candidates for profile grid / thumbnails. */
export function getPostGridThumbnailCandidates(post: UserPostDoc): string[] {
  const { original, low, poster } = getPostVideoVariants(post);
  return uniqueUrls(
    post.postVideothumbnail,
    poster,
    inferThumbUrlFromVideo(original),
    inferThumbUrlFromVideo(low),
    pickImageSource(post, "grid"),
  );
}

/** Best video URL for grid frame fallback (iOS-safe). */
export function pickGridVideoPreviewUrl(post: UserPostDoc): string {
  const { original, low } = getPostVideoVariants(post);
  return pickPlayableSrc([original, low]);
}
