"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  enrichPostsWithUsers,
  getFeedPostsPage,
  getVideoPostsPage,
} from "@/lib/services/firestore";
import { useAppStore, type EnrichedPost } from "@/store/appStore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

const FEED_PAGE_SIZE = 10;
const REELS_PAGE_SIZE = 12;

/** Home feed — caches first page only */
export function useFeedPosts() {
  const hydrated = useStoreHydration();
  const postsCache = useAppStore((s) => s.posts);
  const lastFetched = useAppStore((s) => s.lastFetched.posts);
  const setPostsCache = useAppStore((s) => s.setPostsCache);
  const appendFeedPosts = useAppStore((s) => s.appendFeedPosts);
  const clearPostsCache = useAppStore((s) => s.clearPostsCache);

  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Fallback cursor for cache-restored sessions (DocumentSnapshot not serializable)
  const dateCursorRef = useRef<Date | null>(null);
  const fetchRef = useRef(0);
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const hasValidCache =
    hydrated && postsCache !== null && !isCacheExpired(lastFetched);

  const syncFromCache = useCallback(() => {
    if (!postsCache) return;
    setLocalPosts(postsCache.posts);
    setHasMore(postsCache.hasMore);
    cursorRef.current = null;
    // Use last post's timePosted as Date cursor so loadMore doesn't restart from page 1
    const lastPost = postsCache.posts[postsCache.posts.length - 1];
    dateCursorRef.current = lastPost?.timePosted instanceof Date ? lastPost.timePosted : null;
    setInitialized(true);
  }, [postsCache]);

  useEffect(() => {
    if (!hydrated) return;
    if (hasValidCache && !initialized) {
      syncFromCache();
    }
  }, [hydrated, hasValidCache, initialized, syncFromCache]);

  const fetchFirstPage = useCallback(
    async (force = false) => {
      if (!force && postsCache && !isCacheExpired(lastFetched)) {
        syncFromCache();
        return;
      }

      const requestId = ++fetchRef.current;
      const isInitial = !postsCache || force;
      if (force) setRefreshing(true);
      else if (isInitial) setFetching(true);

      cursorRef.current = null;

      try {
        const page = await getFeedPostsPage(FEED_PAGE_SIZE, null);
        const enriched = await enrichPostsWithUsers(page.posts);
        if (requestId !== fetchRef.current) return;

        cursorRef.current = page.lastDoc;
        setLocalPosts(enriched);
        setHasMore(page.hasMore);
        setPostsCache({ posts: enriched, hasMore: page.hasMore });
        setInitialized(true);
      } finally {
        if (requestId === fetchRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [postsCache, lastFetched, setPostsCache, syncFromCache],
  );

  useEffect(() => {
    if (!hydrated) return;
    void fetchFirstPage(false);
  }, [hydrated, fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      // Prefer live DocumentSnapshot cursor; fall back to Date from cache restore
      const cursor = cursorRef.current ?? dateCursorRef.current;
      const page = await getFeedPostsPage(FEED_PAGE_SIZE, cursor);
      cursorRef.current = page.lastDoc;
      dateCursorRef.current = null; // consumed
      setHasMore(page.hasMore);
      const enriched = await enrichPostsWithUsers(page.posts);
      setLocalPosts((prev) => {
        // Deduplicate — cache restore + loadMore could overlap
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = enriched.filter((p) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
      appendFeedPosts(enriched);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, appendFeedPosts]);

  const refresh = useCallback(async () => {
    clearPostsCache();
    setInitialized(false);
    await fetchFirstPage(true);
  }, [clearPostsCache, fetchFirstPage]);

  return {
    posts: localPosts,
    hasMore,
    loading: hydrated && !hasValidCache && fetching,
    loadingMore,
    refreshing,
    hasCache: hasValidCache,
    loadMore,
    refresh,
    setPosts: setLocalPosts,
  };
}

/** Reels — caches first batch; pagination stays in memory */
export function useReelsPosts() {
  const hydrated = useStoreHydration();
  const reelsCache = useAppStore((s) => s.reels);
  const lastFetched = useAppStore((s) => s.lastFetched.reels);
  const setReelsCache = useAppStore((s) => s.setReelsCache);
  const appendReelsPosts = useAppStore((s) => s.appendReelsPosts);
  const removeReelPost = useAppStore((s) => s.removeReelPost);
  const clearReelsCache = useAppStore((s) => s.clearReelsCache);

  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Fallback cursor for cache-restored sessions (DocumentSnapshot not serializable)
  const dateCursorRef = useRef<Date | null>(null);
  const fetchRef = useRef(0);
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const hasValidCache =
    hydrated && reelsCache !== null && !isCacheExpired(lastFetched);

  const syncFromCache = useCallback(() => {
    if (!reelsCache) return;
    setLocalPosts(reelsCache.posts);
    setHasMore(reelsCache.hasMore);
    cursorRef.current = null;
    // Use last post's timePosted as Date cursor so loadMore doesn't restart from page 1
    const lastPost = reelsCache.posts[reelsCache.posts.length - 1];
    dateCursorRef.current = lastPost?.timePosted instanceof Date ? lastPost.timePosted : null;
    setInitialized(true);
  }, [reelsCache]);

  useEffect(() => {
    if (!hydrated) return;
    if (hasValidCache && !initialized) {
      syncFromCache();
    }
  }, [hydrated, hasValidCache, initialized, syncFromCache]);

  const fetchFirstPage = useCallback(
    async (force = false) => {
      if (!force && reelsCache && !isCacheExpired(lastFetched)) {
        syncFromCache();
        return;
      }

      const requestId = ++fetchRef.current;
      const isInitial = !reelsCache || force;
      if (force) setRefreshing(true);
      else if (isInitial) setFetching(true);

      cursorRef.current = null;

      try {
        const page = await getVideoPostsPage(REELS_PAGE_SIZE, null);
        const enriched = await enrichPostsWithUsers(page.posts);
        if (requestId !== fetchRef.current) return;

        cursorRef.current = page.lastDoc;
        setLocalPosts(enriched);
        setHasMore(page.hasMore);
        setReelsCache({ posts: enriched, hasMore: page.hasMore });
        setInitialized(true);
      } finally {
        if (requestId === fetchRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [reelsCache, lastFetched, setReelsCache, syncFromCache],
  );

  useEffect(() => {
    if (!hydrated) return;
    void fetchFirstPage(false);
  }, [hydrated, fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      // Prefer live DocumentSnapshot cursor; fall back to Date from cache restore
      const cursor = cursorRef.current ?? dateCursorRef.current;
      const page = await getVideoPostsPage(REELS_PAGE_SIZE, cursor);
      cursorRef.current = page.lastDoc;
      dateCursorRef.current = null; // consumed
      setHasMore(page.hasMore);
      const enriched = await enrichPostsWithUsers(page.posts);
      setLocalPosts((prev) => {
        // Deduplicate — cache restore + loadMore could overlap
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = enriched.filter((p) => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
      appendReelsPosts(enriched);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, appendReelsPosts]);

  const refresh = useCallback(async () => {
    clearReelsCache();
    setInitialized(false);
    await fetchFirstPage(true);
  }, [clearReelsCache, fetchFirstPage]);

  const deletePost = useCallback(
    (postId: string) => {
      setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
      removeReelPost(postId);
    },
    [removeReelPost],
  );

  return {
    posts: localPosts,
    hasMore,
    loading: hydrated && !hasValidCache && fetching,
    loadingMore,
    refreshing,
    hasCache: hasValidCache,
    loadMore,
    refresh,
    deletePost,
  };
}
