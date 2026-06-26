"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import {
  resetReelsPopularCatalog,
  sliceReelsPopularCatalog,
} from "@/lib/cache/reels-popular-catalog";
import type { ReelsFeedPhase } from "@/lib/reels/reels-feed-algorithm";
import {
  FEED_PAGE_SIZE,
  REELS_PAGE_SIZE,
} from "@/lib/performance/app-state";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { dedupePostsById } from "@/lib/utils/dedupe-posts";
import {
  postPageCursorFromPost,
  resolvePostPageCursor,
  type PostPageCursor,
} from "@/lib/utils/post-page-cursor";
import {
  enrichPostsWithUsers,
  getFeedPostsPage,
  getRecentWeekVideoPostsPage,
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
  const fallbackCursorRef = useRef<PostPageCursor | null>(null);
  const emptyPageStreakRef = useRef(0);
  const fetchRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>(() => {
    if (typeof window === "undefined") return [];
    const { posts, lastFetched } = useAppStore.getState();
    if (posts && !isCacheExpired(lastFetched.posts)) return dedupePostsById(posts.posts);
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
    const deduped = dedupePostsById(postsCache.posts);
    postsRef.current = deduped;
    hasMoreRef.current = postsCache.hasMore;
    setLocalPosts(deduped);
    setHasMore(postsCache.hasMore);
    cursorRef.current = null;
    const lastPost = deduped[deduped.length - 1];
    fallbackCursorRef.current = lastPost
      ? postPageCursorFromPost(lastPost)
      : null;
    emptyPageStreakRef.current = 0;
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
        return;
      }

      const requestId = ++fetchRef.current;
      const isInitial = !postsCache || force;
      if (force) setRefreshing(true);
      else if (isInitial) setFetching(true);

      cursorRef.current = null;
      fallbackCursorRef.current = null;
      emptyPageStreakRef.current = 0;

      try {
        const page = await getFeedPostsPage(FEED_PAGE_SIZE, null);
        const enriched = await enrichPostsWithUsers(page.posts);
        if (requestId !== fetchRef.current) return;

        cursorRef.current = page.lastDoc;
        const deduped = dedupePostsById(enriched);
        fallbackCursorRef.current = page.lastDoc
          ? null
          : deduped.length > 0
            ? postPageCursorFromPost(deduped[deduped.length - 1]!)
            : null;
        postsRef.current = deduped;
        hasMoreRef.current = page.hasMore;
        setLocalPosts(deduped);
        setHasMore(page.hasMore);
        setPostsCache({ posts: deduped, hasMore: page.hasMore });
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
    if (!hasMore || loadingMore || loadingMoreRef.current) return;
    if (!initialized && postsRef.current.length > 0) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const cursor = await resolvePostPageCursor(
        cursorRef.current ?? fallbackCursorRef.current,
      );
      const page = await getFeedPostsPage(FEED_PAGE_SIZE, cursor);
      cursorRef.current = page.lastDoc;
      const enriched = await enrichPostsWithUsers(page.posts);
      const existingIds = new Set(postsRef.current.map((p) => p.id));
      const fresh = enriched.filter((p) => !existingIds.has(p.id));

      if (fresh.length === 0 && page.posts.length > 0) {
        emptyPageStreakRef.current += 1;
        const last = enriched[enriched.length - 1];
        if (page.lastDoc) {
          fallbackCursorRef.current = null;
          cursorRef.current = page.lastDoc;
        } else if (last) {
          fallbackCursorRef.current = postPageCursorFromPost(last);
        }
        if (emptyPageStreakRef.current >= 3 || !page.hasMore) {
          hasMoreRef.current = false;
          setHasMore(false);
        }
        return;
      }

      emptyPageStreakRef.current = 0;
      fallbackCursorRef.current = page.lastDoc
        ? null
        : enriched.length > 0
          ? postPageCursorFromPost(enriched[enriched.length - 1]!)
          : fallbackCursorRef.current;
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      const next = dedupePostsById([...postsRef.current, ...fresh]);
      postsRef.current = next;
      setLocalPosts(next);
      if (fresh.length) appendFeedPosts(fresh, page.hasMore);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, initialized, appendFeedPosts]);

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
  const fallbackCursorRef = useRef<PostPageCursor | null>(null);
  const emptyPageStreakRef = useRef(0);
  const fetchRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const phaseRef = useRef<ReelsFeedPhase>("recent");
  const popularOffsetRef = useRef(0);
  const [localPosts, setLocalPosts] = useState<EnrichedPost[]>(() => {
    if (typeof window === "undefined") return [];
    const { reels, lastFetched: fetched } = useAppStore.getState();
    if (reels && !isCacheExpired(fetched.reels)) return dedupePostsById(reels.posts);
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
    const deduped = dedupePostsById(reelsCache.posts);
    postsRef.current = deduped;
    hasMoreRef.current = reelsCache.hasMore;
    setLocalPosts(deduped);
    setHasMore(reelsCache.hasMore);
    cursorRef.current = null;
    const lastPost = deduped[deduped.length - 1];
    fallbackCursorRef.current = lastPost
      ? postPageCursorFromPost(lastPost)
      : null;
    emptyPageStreakRef.current = 0;
    setInitialized(true);
  }, [reelsCache]);

  useEffect(() => {
    function restoreFromPersist() {
      const { reels, lastFetched: fetched } = useAppStore.getState();
      if (!reels || isCacheExpired(fetched.reels)) return;
      setLocalPosts(reels.posts);
      setHasMore(reels.hasMore);
      const lastPost = reels.posts[reels.posts.length - 1];
      fallbackCursorRef.current = lastPost
        ? postPageCursorFromPost(lastPost)
        : null;
      emptyPageStreakRef.current = 0;
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
      fallbackCursorRef.current = null;
      emptyPageStreakRef.current = 0;
      phaseRef.current = "recent";
      popularOffsetRef.current = 0;
      resetReelsPopularCatalog();

      try {
        const page = await fetchReelsFirstPage(force);
        if (requestId !== fetchRef.current) return;

        cursorRef.current = page.lastDoc;
        fallbackCursorRef.current =
          page.lastDoc || page.posts.length === 0
            ? null
            : postPageCursorFromPost(page.posts[page.posts.length - 1]!);
        phaseRef.current = page.phase;
        popularOffsetRef.current = page.popularOffset ?? 0;
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

  const appendPopularPage = useCallback(async () => {
    const slice = await sliceReelsPopularCatalog(
      popularOffsetRef.current,
      REELS_PAGE_SIZE,
    );
    popularOffsetRef.current = slice.nextOffset;
    const existingIds = new Set(postsRef.current.map((p) => p.id));
    const fresh = slice.posts.filter((p) => !existingIds.has(p.id));

    hasMoreRef.current = slice.hasMore;
    setHasMore(slice.hasMore);
    if (!fresh.length) return;

    const next = dedupePostsById([...postsRef.current, ...fresh]);
    postsRef.current = next;
    setLocalPosts(next);
    appendReelsPosts(fresh, slice.hasMore);
  }, [appendReelsPosts]);

  const switchToPopularPhase = useCallback(() => {
    phaseRef.current = "popular";
    cursorRef.current = null;
    fallbackCursorRef.current = null;
    emptyPageStreakRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      if (phaseRef.current === "recent") {
        const cursor = await resolvePostPageCursor(
          cursorRef.current ?? fallbackCursorRef.current,
        );
        const page = await getRecentWeekVideoPostsPage(REELS_PAGE_SIZE, cursor);
        const enriched = await enrichPostsWithUsers(page.posts);
        const existingIds = new Set(postsRef.current.map((p) => p.id));
        const fresh = enriched.filter((p) => !existingIds.has(p.id));

        if (fresh.length) {
          emptyPageStreakRef.current = 0;
          cursorRef.current = page.lastDoc;
          fallbackCursorRef.current = page.lastDoc
            ? null
            : postPageCursorFromPost(enriched[enriched.length - 1]!);
          const next = dedupePostsById([...postsRef.current, ...fresh]);
          postsRef.current = next;
          setLocalPosts(next);
          appendReelsPosts(fresh, page.hasMore);
        } else if (page.lastDoc) {
          cursorRef.current = page.lastDoc;
        }

        if (!page.hasMore) {
          switchToPopularPhase();
          await appendPopularPage();
        } else {
          hasMoreRef.current = page.hasMore;
          setHasMore(page.hasMore);
        }
        return;
      }

      await appendPopularPage();
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, appendReelsPosts, appendPopularPage, switchToPopularPhase]);

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
