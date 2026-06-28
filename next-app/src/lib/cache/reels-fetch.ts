import { isCacheExpired } from "@/lib/cache/constants";
import {
  resetReelsPopularCatalog,
  sliceReelsPopularCatalog,
} from "@/lib/cache/reels-popular-catalog";
import type { ReelsFeedPhase } from "@/lib/reels/reels-feed-algorithm";
import {
  enrichPostsWithUsers,
  getRecentWeekVideoPostsPage,
  type PostsPage,
} from "@/lib/services/firestore";
import { prewarmReelsPosts } from "@/lib/utils/video-sources";
import { useAppStore, type EnrichedPost } from "@/store/appStore";
import { REELS_PAGE_SIZE } from "@/lib/performance/app-state";

type ReelsPageResult = {
  posts: EnrichedPost[];
  hasMore: boolean;
};

let inFlight: Promise<ReelsFirstPageResult> | null = null;

export type ReelsFirstPageResult = ReelsPageResult & {
  lastDoc: PostsPage["lastDoc"];
  phase: ReelsFeedPhase;
  popularOffset: number;
};

async function loadInitialReelsPosts(): Promise<ReelsFirstPageResult> {
  resetReelsPopularCatalog();

  const recentPage = await getRecentWeekVideoPostsPage(REELS_PAGE_SIZE, null);
  let enriched = await enrichPostsWithUsers(recentPage.posts);
  let phase: ReelsFeedPhase = "recent";
  let hasMore = recentPage.hasMore;
  let lastDoc = recentPage.lastDoc;
  let popularOffset = 0;

  if (!recentPage.hasMore) {
    phase = "popular";
    const slice = await sliceReelsPopularCatalog(0, REELS_PAGE_SIZE);
    const existingIds = new Set(enriched.map((p) => p.id));
    const freshPopular = slice.posts.filter((p) => !existingIds.has(p.id));
    enriched = [...enriched, ...freshPopular];
    popularOffset = slice.nextOffset;
    hasMore = slice.hasMore;
    lastDoc = null;
  } else if (enriched.length === 0) {
    phase = "popular";
    const slice = await sliceReelsPopularCatalog(0, REELS_PAGE_SIZE);
    enriched = slice.posts;
    popularOffset = slice.nextOffset;
    hasMore = slice.hasMore;
    lastDoc = null;
  }

  return {
    posts: enriched,
    hasMore,
    lastDoc,
    phase,
    popularOffset,
  };
}

function prewarmLeadingReelsPosts(posts: EnrichedPost[]): void {
  if (typeof window === "undefined" || posts.length === 0) return;
  prewarmReelsPosts([posts[0]!], "slow");
  if (posts[1]) prewarmReelsPosts([posts[1]], "slow");
}

/** Single shared reels first-page fetch — newest from last 7 days first. */
export async function fetchReelsFirstPage(
  force = false,
): Promise<ReelsFirstPageResult> {
  const store = useAppStore.getState();
  const { reels, lastFetched } = store;

  if (!force && reels && !isCacheExpired(lastFetched.reels)) {
    const stalePartial =
      !reels.hasMore && reels.posts.length > 0 && reels.posts.length < REELS_PAGE_SIZE;
    if (!stalePartial) {
      prewarmLeadingReelsPosts(reels.posts);
      return {
        posts: reels.posts,
        hasMore: reels.hasMore,
        lastDoc: null,
        phase: reels.phase ?? "recent",
        popularOffset: reels.popularOffset ?? 0,
      };
    }
  }

  if (!force && inFlight) return inFlight;

  const promise = (async (): Promise<ReelsFirstPageResult> => {
    const result = await loadInitialReelsPosts();
    useAppStore.getState().setReelsCache({
      posts: result.posts,
      hasMore: result.hasMore,
      phase: result.phase,
      popularOffset: result.popularOffset,
    });
    if (typeof window !== "undefined" && result.posts.length > 0) {
      prewarmLeadingReelsPosts(result.posts);
    }
    return result;
  })();

  if (!force) {
    inFlight = promise;
    void promise.finally(() => {
      if (inFlight === promise) inFlight = null;
    });
  }

  return promise;
}

export function invalidateReelsFetchCache(): void {
  inFlight = null;
  resetReelsPopularCatalog();
}
