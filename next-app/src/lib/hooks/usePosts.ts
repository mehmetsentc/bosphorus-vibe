"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import {
  FEED_PAGE_SIZE,
  REELS_PAGE_SIZE,
} from "@/lib/performance/app-state";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  enrichPostsWithUsers,
  getFeedPostsPage,
  getVideoPostsPage,
} from "@/lib/services/firestore";
import { useAppStore, type EnrichedPost } from "@/store/appStore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";


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
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>(() => {
    if (typeof window === "undefined") return [];
    const { posts, lastFetched } = useAppStore.getState();
    if (posts && !isCacheExpired(lastFetched.posts)) return posts.posts;
    return [];
  });
  const [hasMore, setHasMore] = useState(() => {
    if (typeof window === "undefined") return true;
    return useAppStore.getState().posts?.hasMore ?? true;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [initialized, setInitialized] = useState(() => {
    if (typeof window === "undefined") return false;
    const { posts, lastFetched } = useAppStore.getState();
    return posts !== null && !isCacheExpired(lastFetched.posts);
  });

  const postsRef = useRef(localPosts);
  const hasMoreRef = useRef(hasMore);
  postsRef.current = localPosts;
  hasMoreRef.current = hasMore;

  const hasValidCache =
    hydrated && postsCache !== null && !isCacheExpired(lastFetched);

  const syncFromCache = useCallback(() => {
    if (!postsCache) return;
    postsRef.current = postsCache.posts;
    hasMoreRef.current = postsCache.hasMore;
    setLocalPosts(postsCache.posts);
    setHasMore(postsCache.hasMore);
    cursorRef.current = null;
    // Use last post's timePosted as Date cursor so loadMore doesn't restart from page 1
    const lastPost = postsCache.posts[postsCache.posts.length - 1];
    dateCursorRef.current = lastPost?.timePosted instanceof Date ? lastPost.timePosted : null;
    setInitialized(true);
  }, [postsCache]);

  useLayoutEffect(() => {
    if (!hydrated) return;
    if (hasValidCache && !initialized) {
      syncFromCache();
    }
  }, [hydrated, hasValidCache, initialized, syncFromCache]);

  const fetchFirstPage = useCallback(
    async (force = false) => {
      if (!force && postsCache && !isCacheExpired(lastFetched)) {
        syncFromCache();
        postsRef.current = postsCache.posts;
        hasMoreRef.current = postsCache.hasMore;
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
        postsRef.current = enriched;
        hasMoreRef.current = page.hasMore;
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
      const cursor = cursorRef.current ?? dateCursorRef.current;
      const page = await getFeedPostsPage(FEED_PAGE_SIZE, cursor);
      cursorRef.current = page.lastDoc;
      dateCursorRef.current = null;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      const enriched = await enrichPostsWithUsers(page.posts);
      setLocalPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = enriched.filter((p) => !existingIds.has(p.id));
        const next = [...prev, ...fresh];
        postsRef.current = next;
        return next;
      });
      appendFeedPosts(enriched, page.hasMore);
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
    loading:
      !hydrated || (localPosts.length === 0 && (!initialized || fetching)),
    loadingMore,
    refreshing,
    hasCache: hasValidCache,
    loadMore,
    refresh,
    setPosts: setLocalPosts,
    postsSnapshot: postsRef,
    hasMoreSnapshot: hasMoreRef,
  };
}

/** Reels — caches first batch; pagination stays in memory */
export function useReelsPosts() {
  const hydrated = useStoreHydration();
  const reelsCache = useAppStore((s) => s.reels);
  const lastFetched = useAppStore((s) => s.lastFetched.reels);
  const appendReelsPosts = useAppStore((s) => s.appendReelsPosts);
  const removeReelPost = useAppStore((s) => s.removeReelPost);
  const clearReelsCache = useAppStore((s) => s.clearReelsCache);

  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  // Fallback cursor for cache-restored sessions (DocumentSnapshot not serializable)
  const dateCursorRef = useRef<Date | null>(null);
  const fetchRef = useRef(0);
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>(() => {
    if (typeof window === "undefined") return [];
    const { reels, lastFetched: fetched } = useAppStore.getState();
    if (reels && !isCacheExpired(fetched.reels)) return reels.posts;
    return [];
  });
  const [hasMore, setHasMore] = useState(() => {
    if (typeof window === "undefined") return true;
    const { reels, lastFetched: fetched } = useAppStore.getState();
    return reels?.hasMore ?? true;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [initialized, setInitialized] = useState(() => {
    if (typeof window === "undefined") return false;
    const { reels, lastFetched: fetched } = useAppStore.getState();
    return reels !== null && !isCacheExpired(fetched.reels);
  });

  const postsRef = useRef(localPosts);
  const hasMoreRef = useRef(hasMore);
  postsRef.current = localPosts;
  hasMoreRef.current = hasMore;

  const hasValidCache =
    hydrated && reelsCache !== null && !isCacheExpired(lastFetched);

  const syncFromCache = useCallback(() => {
    if (!reelsCache) return;
    postsRef.current = reelsCache.posts;
    hasMoreRef.current = reelsCache.hasMore;
    setLocalPosts(reelsCache.posts);
    setHasMore(reelsCache.hasMore);
    cursorRef.current = null;
    // Use last post's timePosted as Date cursor so loadMore doesn't restart from page 1
    const lastPost = reelsCache.posts[reelsCache.posts.length - 1];
    dateCursorRef.current = lastPost?.timePosted instanceof Date ? lastPost.timePosted : null;
    setInitialized(true);
  }, [reelsCache]);

  useEffect(() => {
    function restoreFromPersist() {
      const { reels, lastFetched: fetched } = useAppStore.getState();
      if (!reels || isCacheExpired(fetched.reels)) return;
      setLocalPosts(reels.posts);
      setHasMore(reels.hasMore);
      const lastPost = reels.posts[reels.posts.length - 1];
      dateCursorRef.current =
        lastPost?.timePosted instanceof Date ? lastPost.timePosted : null;
      setInitialized(true);
    }

    if (useAppStore.persist.hasHydrated()) {
      restoreFromPersist();
      return;
    }
    return useAppStore.persist.onFinishHydration(restoreFromPersist);
  }, []);

  useLayoutEffect(() => {
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
        const page = await fetchReelsFirstPage(force);
        if (requestId !== fetchRef.current) return;

        cursorRef.current = page.lastDoc;
        postsRef.current = page.posts;
        hasMoreRef.current = page.hasMore;
        setLocalPosts(page.posts);
        setHasMore(page.hasMore);
        setInitialized(true);
      } finally {
        if (requestId === fetchRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [reelsCache, lastFetched, syncFromCache],
  );

  useEffect(() => {
    if (!hydrated) return;
    void fetchFirstPage(false);
  }, [hydrated, fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const cursor = cursorRef.current ?? dateCursorRef.current;
      const page = await getVideoPostsPage(REELS_PAGE_SIZE, cursor);
      cursorRef.current = page.lastDoc;
      dateCursorRef.current = null;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      const enriched = await enrichPostsWithUsers(page.posts);
      setLocalPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const fresh = enriched.filter((p) => !existingIds.has(p.id));
        const next = [...prev, ...fresh];
        postsRef.current = next;
        return next;
      });
      appendReelsPosts(enriched, page.hasMore);
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
    loading:
      !hydrated || (localPosts.length === 0 && (!initialized || fetching)),
    loadingMore,
    refreshing,
    hasCache: hasValidCache,
    loadMore,
    refresh,
    deletePost,
    postsSnapshot: postsRef,
    hasMoreSnapshot: hasMoreRef,
  };
}
