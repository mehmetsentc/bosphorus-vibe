"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fillUnseenPages,
  getDisplayPosts,
  getSeenPostIds,
  markPostSeen,
  shouldLoadMoreForUnseen,
  type DisplayPostsOptions,
} from "@/lib/utils/seenPosts";
import { dedupePostsById } from "@/lib/utils/dedupe-posts";

/**
 * Filters posts for display while keeping items visible for the current session
 * once they were shown (avoids posts vanishing mid-scroll when marked seen).
 */
function filterWithSessionLock<T extends { id: string }>(
  posts: T[],
  userId: string | undefined,
  locked: Set<string>,
  options?: DisplayPostsOptions,
): T[] {
  if (!posts.length) return posts;

  const unique = dedupePostsById(posts);
  const pinSet = new Set(options?.pinIds ?? []);
  const seen = getSeenPostIds(userId);
  const out: T[] = [];

  for (const post of unique) {
    const wasLocked = locked.has(post.id);
    const isUnseen = !seen.has(post.id) || pinSet.has(post.id);
    if (isUnseen || wasLocked) {
      out.push(post);
      locked.add(post.id);
    }
  }

  if (out.length > 0) return out;

  // Recycle when every post in batch was seen before this session
  for (const post of unique) locked.add(post.id);
  return unique;
}

export function useSeenPosts(options?: DisplayPostsOptions) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [revision, setRevision] = useState(0);
  const sessionLockedRef = useRef(new Set<string>());

  const invalidate = useCallback(() => {
    sessionLockedRef.current.clear();
    setRevision((n) => n + 1);
  }, []);

  const markSeen = useCallback(
    (postId: string) => {
      markPostSeen(postId, userId);
    },
    [userId],
  );

  const pinKey = options?.pinIds?.join("|") ?? "";

  const filterPosts = useCallback(
    <T extends { id: string }>(posts: T[]): T[] =>
      filterWithSessionLock(posts, userId, sessionLockedRef.current, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, pinKey, revision],
  );

  /** Strict filter (refresh) — ignores session lock */
  const filterPostsFresh = useCallback(
    <T extends { id: string }>(posts: T[]): T[] =>
      getDisplayPosts(posts, userId, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, pinKey, revision],
  );

  const needsMore = useCallback(
    (displayCount: number, hasMore: boolean) =>
      shouldLoadMoreForUnseen(displayCount, hasMore),
    [],
  );

  const refreshWithUnseen = useCallback(
    async (
      refresh: () => Promise<void>,
      loadMore: () => Promise<void>,
      getPosts: () => { id: string }[],
      getHasMore: () => boolean,
    ) => {
      sessionLockedRef.current.clear();
      await refresh();
      setRevision((n) => n + 1);
      await fillUnseenPages(filterPostsFresh, getPosts, getHasMore, loadMore);
      setRevision((n) => n + 1);
    },
    [filterPostsFresh],
  );

  return useMemo(
    () => ({
      markSeen,
      filterPosts,
      needsMore,
      invalidate,
      refreshWithUnseen,
      revision,
    }),
    [markSeen, filterPosts, needsMore, invalidate, refreshWithUnseen, revision],
  );
}
