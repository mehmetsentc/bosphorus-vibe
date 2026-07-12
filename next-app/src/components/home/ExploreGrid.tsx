"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFeedPostsPage, enrichPostsWithUsers } from "@/lib/services/firestore";
import { useAppStore, type EnrichedPost } from "@/store/appStore";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const PAGE_SIZE = 24;

// ─── helpers ────────────────────────────────────────────────────────────────

function formatViews(n: number | undefined): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}MN`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

function getThumbnail(post: EnrichedPost): string | null {
  if (post.hasVideo) {
    return (
      post.postVideothumbnail ||
      post.postPhotoURL_low ||
      post.postPhotoURL ||
      null
    );
  }
  return post.postPhotoURL_low || post.postPhotoURL || null;
}

// ─── skeleton ───────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-[1.5px]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square w-full animate-pulse bg-surface-overlay"
        />
      ))}
    </div>
  );
}

// ─── single cell ────────────────────────────────────────────────────────────

function GridCell({ post }: { post: EnrichedPost }) {
  const router = useRouter();
  const thumb = getThumbnail(post);
  const views = formatViews(post.numViews);
  const isVideo = Boolean(post.hasVideo);

  const handleTap = useCallback(() => {
    router.push(`/post/${post.id}`);
  }, [router, post.id]);

  if (!thumb) return null;

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative aspect-square w-full overflow-hidden bg-surface-overlay focus:outline-none active:opacity-80 transition-opacity"
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />

      {/* Video badge — top-right */}
      {isVideo && (
        <div className="absolute right-1.5 top-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="white"
            className="drop-shadow-md"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* View count — bottom-left */}
      {views && (
        <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="white"
            className="drop-shadow-md"
          >
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span className="text-[10px] font-bold leading-none text-white drop-shadow-md">
            {views}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function ExploreGrid() {
  const postsCache = useAppStore((s) => s.posts);
  const appendFeedPosts = useAppStore((s) => s.appendFeedPosts);
  const setPostsCache = useAppStore((s) => s.setPostsCache);

  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // Initial load — reuse app-level cache if available
  useEffect(() => {
    if (postsCache?.posts && postsCache.posts.length > 0) {
      setPosts(postsCache.posts);
      setHasMore(postsCache.hasMore ?? true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const page = await getFeedPostsPage(PAGE_SIZE, null);
        const enriched = await enrichPostsWithUsers(page.posts);
        if (cancelled) return;
        cursorRef.current = page.lastDoc ?? null;
        setPostsCache({ posts: enriched, hasMore: page.hasMore });
        setPosts(enriched);
        setHasMore(page.hasMore);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more
  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    try {
      const page = await getFeedPostsPage(PAGE_SIZE, cursorRef.current);
      const enriched = await enrichPostsWithUsers(page.posts);
      cursorRef.current = page.lastDoc ?? null;
      const ids = new Set(posts.map((p) => p.id));
      const fresh = enriched.filter((p) => !ids.has(p.id));
      if (fresh.length > 0) {
        appendFeedPosts(fresh, page.hasMore);
        setPosts((prev) => [...prev, ...fresh]);
      }
      setHasMore(page.hasMore);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, posts, appendFeedPosts]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading) return <GridSkeleton />;

  if (!posts.length) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Henüz gönderi yok
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-[1.5px]">
        {posts.map((post) => (
          <GridCell key={post.id} post={post} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div className="grid grid-cols-3 gap-[1.5px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full animate-pulse bg-surface-overlay"
            />
          ))}
        </div>
      )}
    </div>
  );
}
