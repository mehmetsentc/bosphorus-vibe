import { isCacheExpired } from "@/lib/cache/constants";
import {
  getActiveStories,
  groupStoriesByUser,
} from "@/lib/services/stories";
import { useAppStore } from "@/store/appStore";
import { getFirebaseAuth } from "@/lib/firebase";

let inflight: Promise<void> | null = null;

/** Warm stories strip cache on app shell mount. */
export function prefetchStoriesFeed(): Promise<void> {
  const { storiesFeed, lastFetched } = useAppStore.getState();
  if (storiesFeed && !isCacheExpired(lastFetched.storiesFeed)) {
    return Promise.resolve();
  }

  if (!inflight) {
    inflight = (async () => {
      const viewerUid = getFirebaseAuth().currentUser?.uid;
      const stories = await getActiveStories();
      const groups = await groupStoriesByUser(stories, viewerUid);
      useAppStore.getState().setStoriesFeedCache(groups);
    })()
      .catch(() => {})
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}
