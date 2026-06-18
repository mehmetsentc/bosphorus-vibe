import { isCacheExpired } from "@/lib/cache/constants";
import {
  enrichPostsWithUsers,
  getVideoPostsPage,
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
};

/** Single shared reels first-page fetch — avoids duplicate Firestore reads. */
export async function fetchReelsFirstPage(
  force = false,
): Promise<ReelsFirstPageResult> {
  const store = useAppStore.getState();
  const { reels, lastFetched } = store;

  if (!force && reels && !isCacheExpired(lastFetched.reels)) {
    return { posts: reels.posts, hasMore: reels.hasMore, lastDoc: null };
  }

  if (!force && inFlight) return inFlight;

  const promise = (async (): Promise<ReelsFirstPageResult> => {
    const page: PostsPage = await getVideoPostsPage(REELS_PAGE_SIZE, null);
    const enriched = await enrichPostsWithUsers(page.posts);
    const result: ReelsFirstPageResult = {
      posts: enriched,
      hasMore: page.hasMore,
      lastDoc: page.lastDoc,
    };
    useAppStore.getState().setReelsCache({
      posts: result.posts,
      hasMore: result.hasMore,
    });
    if (typeof window !== "undefined") {
      prewarmReelsPosts(enriched.slice(0, 3), "slow");
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
