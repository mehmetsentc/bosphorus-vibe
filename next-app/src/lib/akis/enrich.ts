import { enrichPostsWithUsers } from "@/lib/services/firestore";
import type { EnrichedPost } from "@/store/appStore";
import type { UserPostDoc } from "@/types";

type CachedUser = { name?: string; photo?: string };

const userCache = new Map<string, CachedUser>();

/** Enrich with the existing user lookup. Cached ids are not read again. */
export async function enrichAkisPosts(posts: UserPostDoc[]): Promise<EnrichedPost[]> {
  const missing = posts.filter(
    (post) => post.postUserId && !userCache.has(post.postUserId),
  );
  if (missing.length) {
    const enriched = await enrichPostsWithUsers(missing);
    const seen = new Set<string>();
    for (const post of missing) {
      if (post.postUserId) seen.add(post.postUserId);
    }
    for (const id of seen) {
      userCache.set(id, {});
    }
    for (const post of enriched) {
      if (!post.postUserId) continue;
      userCache.set(post.postUserId, {
        name: post.userName,
        photo: post.userPhoto,
      });
    }
  }

  return posts.map((post) => {
    const cached = post.postUserId ? userCache.get(post.postUserId) : undefined;
    return {
      ...post,
      userName: cached?.name,
      userPhoto: cached?.photo,
    };
  });
}
