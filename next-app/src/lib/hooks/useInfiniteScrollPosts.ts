"use client";

import { useCallback, useMemo, useState } from "react";
import { dedupePostsById } from "@/lib/utils/dedupe-posts";

export type InfiniteScrollItem<T> = {
  post: T;
  itemKey: string;
};

/** Unseen first; when all server pages loaded, append seen posts (TikTok/IG style). */
function buildBaseDisplay<T extends { id: string }>(
  posts: T[],
  hasMore: boolean,
  filterPosts: (posts: T[]) => T[],
): T[] {
  const unseen = filterPosts(posts);
  if (hasMore) return unseen;
  if (unseen.length >= posts.length) return unseen;
  const unseenIds = new Set(unseen.map((p) => p.id));
  const seenTail = posts.filter((p) => !unseenIds.has(p.id));
  return [...unseen, ...seenTail];
}

/**
 * Infinite scroll list — keeps fetching while hasMore, then cycles the loaded catalog.
 */
export function useInfiniteScrollPosts<T extends { id: string }>(
  posts: T[],
  hasMore: boolean,
  filterPosts: (posts: T[]) => T[],
) {
  const [cycleCount, setCycleCount] = useState(0);

  const catalog = useMemo(() => dedupePostsById(posts), [posts]);

  const baseDisplay = useMemo(
    () => buildBaseDisplay(posts, hasMore, filterPosts),
    [posts, hasMore, filterPosts],
  );

  const items = useMemo((): InfiniteScrollItem<T>[] => {
    const result: InfiniteScrollItem<T>[] = baseDisplay.map((post) => ({
      post,
      itemKey: post.id,
    }));

    if (!hasMore && catalog.length > 0 && cycleCount > 0) {
      for (let c = 0; c < cycleCount; c++) {
        for (const post of catalog) {
          result.push({ post, itemKey: `${post.id}~c${c + 1}` });
        }
      }
    }

    return result;
  }, [baseDisplay, catalog, cycleCount, hasMore]);

  const appendCycle = useCallback(() => {
    if (hasMore || catalog.length === 0) return;
    setCycleCount((n) => n + 1);
  }, [hasMore, catalog.length]);

  const resetCycles = useCallback(() => {
    setCycleCount(0);
  }, []);

  return {
    items,
    appendCycle,
    resetCycles,
    catalogLength: catalog.length,
  };
}
