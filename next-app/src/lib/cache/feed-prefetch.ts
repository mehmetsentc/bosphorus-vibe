import { isCacheExpired } from "@/lib/cache/constants";
import { FEED_PAGE_SIZE } from "@/lib/performance/app-state";
import {
  enrichPostsWithUsers,
  getFeedPostsPage,
} from "@/lib/services/firestore";
import {
  hasPostVideo,
  pickVideoSource,
  prewarmVideoUrls,
} from "@/lib/utils/video-sources";
import { useAppStore } from "@/store/appStore";

let inflight: Promise<void> | null = null;

/** Shared in-flight prefetch — home hook reuses cache without duplicate reads. */
export function prefetchFeedFirstPage(): Promise<void> {
  const { posts, lastFetched } = useAppStore.getState();
  if (posts && !isCacheExpired(lastFetched.posts)) {
    return Promise.resolve();
  }

  if (!inflight) {
    inflight = (async () => {
      const page = await getFeedPostsPage(FEED_PAGE_SIZE, null);
      const enriched = await enrichPostsWithUsers(page.posts);
      useAppStore.getState().setPostsCache({
        posts: enriched,
        hasMore: page.hasMore,
      });
      if (typeof window !== "undefined") {
        const urls = enriched
          .filter(hasPostVideo)
          .slice(0, 2)
          .map((post) => pickVideoSource(post, "slow", "feed").src)
          .filter(Boolean);
        prewarmVideoUrls(urls);
      }
    })()
      .catch(() => {})
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}
