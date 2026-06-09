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

/** Yavaş bağlantıda düşük, hızlıda orijinal kalite */
export function pickVideoSource(
  post: UserPostDoc,
  tier: NetworkTier,
): { src: string; poster?: string } {
  const { original, low, poster } = getPostVideoVariants(post);

  if (tier === "slow") {
    return { src: low || original, poster };
  }
  return { src: original || low, poster };
}

/**
 * Returns the best image URL for a given context.
 *
 * - `"feed"` / `"grid"` → always low quality (fast scroll)
 * - `"detail"` → original quality (full-screen / post page)
 * - Falls back to whatever is available.
 */
export function pickImageSource(
  post: UserPostDoc,
  context: "feed" | "grid" | "detail" = "feed",
): string {
  const low =
    post.postPhotoURL_low ||
    post.postPhotoURL ||    // postPhotoURL is the compressed version in new posts
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
