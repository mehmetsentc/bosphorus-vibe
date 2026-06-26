import type { EnrichedPost } from "@/store/appStore";
import {
  enrichPostsWithUsers,
  getVideoPostsPage,
} from "@/lib/services/firestore";
import {
  getReelsRecentWindowStart,
  sortPostsByReelsPopularity,
} from "@/lib/reels/reels-feed-algorithm";
import type { UserPostDoc } from "@/types";

let popularCatalogPromise: Promise<EnrichedPost[]> | null = null;

export function resetReelsPopularCatalog(): void {
  popularCatalogPromise = null;
}

/** Load all videos older than the recent window, sorted by views + likes. */
export async function buildReelsPopularCatalog(): Promise<EnrichedPost[]> {
  if (popularCatalogPromise) return popularCatalogPromise;

  popularCatalogPromise = (async () => {
    const windowStart = getReelsRecentWindowStart();
    const collected: UserPostDoc[] = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
      const page = await getVideoPostsPage(50, cursor);
      for (const post of page.posts) {
        if (post.timePosted.getTime() < windowStart.getTime()) {
          collected.push(post);
        }
      }
      cursor = page.lastDoc;
      hasMore = page.hasMore;
      if (collected.length > 2000) break;
    }

    const ranked = sortPostsByReelsPopularity(collected);
    return enrichPostsWithUsers(ranked);
  })();

  return popularCatalogPromise;
}

export async function sliceReelsPopularCatalog(
  offset: number,
  pageSize: number,
): Promise<{ posts: EnrichedPost[]; hasMore: boolean; nextOffset: number }> {
  const catalog = await buildReelsPopularCatalog();
  const posts = catalog.slice(offset, offset + pageSize);
  const nextOffset = offset + posts.length;
  return {
    posts,
    hasMore: nextOffset < catalog.length,
    nextOffset,
  };
}
