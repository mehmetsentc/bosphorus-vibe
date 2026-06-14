import { isCacheExpired } from "@/lib/cache/constants";
import { PROFILE_POSTS_LIMIT } from "@/lib/performance/app-state";
import {
  getFollowStats,
  getPostsByUser,
  getPostsTaggingUser,
} from "@/lib/services/firestore";
import { getStoriesByUser } from "@/lib/services/stories";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";

let inflight: Promise<void> | null = null;

/** Prefetch signed-in user's profile grid for instant /profile open. */
export function prefetchOwnProfile(): Promise<void> {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) return Promise.resolve();

  const { profileData, lastFetched } = useAppStore.getState();
  if (
    profileData?.uid === uid &&
    !isCacheExpired(lastFetched.profile)
  ) {
    return Promise.resolve();
  }

  if (!inflight) {
    inflight = (async () => {
      const [posts, stats, tagged, stories] = await Promise.all([
        getPostsByUser(uid, PROFILE_POSTS_LIMIT),
        getFollowStats(uid),
        getPostsTaggingUser(uid),
        getStoriesByUser(uid),
      ]);
      useAppStore.getState().setProfileData({
        uid,
        posts,
        taggedPosts: tagged,
        stories,
        followers: stats.followers,
        following: stats.following,
      });
    })()
      .catch(() => {})
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}
