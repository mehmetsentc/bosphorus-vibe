import type { EnrichedPost, PostsCache, ReelsCache } from "@/store/appStore";
import type { UserPostDoc } from "@/types";

/** Max posts kept in localStorage — full lists stay in memory during session. */
export const PERSIST_POSTS_MAX = 12;
export const PERSIST_PROFILE_POSTS_MAX = 24;

/** Strip redundant URL variants to shrink hydration JSON. */
function slimPost(post: UserPostDoc): UserPostDoc {
  const slim: UserPostDoc = { ...post };
  if (slim.postVideoURL_low && slim.postVideoURL_low === slim.postVideoURL) {
    delete slim.postVideoURL;
  }
  if (
    slim.postVideoURL_original &&
    slim.postVideoURL_original === slim.postVideoURL_low
  ) {
    delete slim.postVideoURL_original;
  }
  if (slim.postPhotoURL_low && slim.postPhotoURL_low === slim.postPhotoURL) {
    delete slim.postPhotoURL;
  }
  return slim;
}

export function slimEnrichedPosts(posts: EnrichedPost[]): EnrichedPost[] {
  return posts.slice(0, PERSIST_POSTS_MAX).map((p) => slimPost(p) as EnrichedPost);
}

export function slimPostsCache(cache: PostsCache | null): PostsCache | null {
  if (!cache) return null;
  return {
    hasMore: cache.hasMore,
    posts: slimEnrichedPosts(cache.posts),
  };
}

export function slimReelsCache(cache: ReelsCache | null): ReelsCache | null {
  if (!cache) return null;
  return {
    hasMore: cache.hasMore,
    posts: slimEnrichedPosts(cache.posts),
  };
}
