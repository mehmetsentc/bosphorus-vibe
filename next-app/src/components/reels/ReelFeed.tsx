"use client";

/**
 * ReelFeed — TikTok/Instagram-style vertical video feed.
 *
 * Design principles:
 *  • ONE React state variable drives navigation: activeIndex.
 *  • play/pause/mute are direct DOM calls — zero React re-renders on scroll.
 *  • Videos within REELS_DOM_WINDOW_RADIUS are always mounted in DOM.
 *  • Videos within videoWindow get preload="auto" — browser buffers ahead silently.
 *  • src is NEVER cleared once loaded — buffered data stays in memory.
 *  • Poster on <video> hides black frames natively; no loading state needed.
 *  • Mute uses 2 React state vars only for the flash icon — everything else is a ref.
 */

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { getFastFlowPlaybackUrl, getPostVideoPoster } from "@/lib/utils/video-sources";
import { VideoFeedSideActions } from "@/components/video/VideoFeedSideActions";
import { useReelsViewportHeight } from "@/lib/hooks/useReelsViewportHeight";
import { useT } from "@/components/providers/I18nProvider";
import {
  INFINITE_SCROLL_NEAR_END,
  REELS_DOM_WINDOW_RADIUS,
  getReelsVideoWindowRadius,
} from "@/lib/performance/app-state";
import { IconVolumeOff, IconVolumeOn } from "@/components/icons/Icons";
import type { UserPostDoc } from "@/types";

const PostCommentModal = dynamic(
  () => import("@/components/post/PostCommentModal").then((m) => ({ default: m.PostCommentModal })),
  { ssr: false },
);

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

type ReelFeedProps = {
  posts: EnrichedPost[];
  postKeys?: string[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onNearCatalogEnd?: () => void;
  onActiveChange?: (index: number) => void;
  onPostDeleted?: (postId: string) => void;
  guestPreview?: boolean;
  initialPostId?: string;
  onPostSeen?: (postId: string) => void;
  scrollContainerRef?: MutableRefObject<HTMLDivElement | null>;
  resetScrollToken?: number;
};

// ─── MuteIndicator — flashes volume icon, minimal state ──────────────────────

function MuteIndicator({ muted, flashKey }: { muted: boolean; flashKey: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (flashKey === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(t);
  }, [flashKey]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="rounded-full bg-black/50 p-4">
        {muted ? (
          <IconVolumeOff size={36} className="text-white" />
        ) : (
          <IconVolumeOn size={36} className="text-white" />
        )}
      </div>
    </div>
  );
}

// ─── Per-slide — re-renders only when isActive/dist/mute changes ──────────────

type ReelSlideProps = {
  post: EnrichedPost;
  isActive: boolean;
  dist: number;
  /** Radius within which video element is mounted with preload="auto" */
  videoWindow: number;
  videoRefCallback: (el: HTMLVideoElement | null) => void;
  onCommentClick: () => void;
  onPostDeleted: () => void;
  onMuteToggle: () => void;
  muteFlashKey: number;
  isMuted: boolean;
};

const ReelSlide = memo(function ReelSlide({
  post,
  isActive,
  dist,
  videoWindow,
  videoRefCallback,
  onCommentClick,
  onPostDeleted,
  onMuteToggle,
  muteFlashKey,
  isMuted,
}: ReelSlideProps) {
  const src = getFastFlowPlaybackUrl(post);
  const poster = getPostVideoPoster(post) ?? post.postVideothumbnail ?? undefined;

  // Within DOM_WINDOW_RADIUS: always render slide shell
  // Within videoWindow: mount <video> with preload="auto"
  const mountVideo = dist <= videoWindow && !!src;
  // Show poster only within DOM_WINDOW_RADIUS — distant slides stay as black placeholders
  const showPoster = poster && !mountVideo && dist <= REELS_DOM_WINDOW_RADIUS;

  return (
    <div className="reels-slide relative bg-black" onClick={onMuteToggle}>
      {/* Static poster — shown for nearby non-video slides */}
      {showPoster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}

      {/* Video — stays mounted within videoWindow, browser handles poster natively */}
      {mountVideo && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRefCallback}
          src={src}
          poster={poster}
          preload="auto"
          playsInline
          loop
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Overlays — active slide only */}
      {isActive && (
        <>
          <VideoFeedSideActions
            post={post}
            onCommentClick={onCommentClick}
            onPostDeleted={onPostDeleted}
          />
          <MuteIndicator muted={isMuted} flashKey={muteFlashKey} />
        </>
      )}
    </div>
  );
});

// ─── Main Feed ────────────────────────────────────────────────────────────────

export function ReelFeed({
  posts: initialPosts,
  postKeys,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onNearCatalogEnd,
  onActiveChange,
  onPostDeleted,
  guestPreview = false,
  initialPostId,
  onPostSeen,
  scrollContainerRef,
  resetScrollToken,
}: ReelFeedProps) {
  const t = useT();
  const router = useRouter();

  // Device-aware video window (iOS: 1, Android/desktop: 2)
  const videoWindow = useMemo(() => {
    if (typeof window === "undefined") return REELS_DOM_WINDOW_RADIUS;
    return getReelsVideoWindowRadius();
  }, []);

  // ─── Container ref ───────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as MutableRefObject<HTMLDivElement | null>).current = el;
      if (scrollContainerRef)
        (scrollContainerRef as MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [scrollContainerRef],
  );
  useReelsViewportHeight(containerRef);

  // ─── Posts state ─────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(initialPosts);
  useEffect(() => setPosts(initialPosts), [initialPosts]);

  const videoPosts = useMemo(() => posts.filter((p) => getPostVideoUrl(p)), [posts]);
  const visiblePosts = guestPreview ? videoPosts.slice(0, 6) : videoPosts;

  // ─── Active slide index — the ONE React navigation state ─────────────────
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!initialPostId) return 0;
    const vp = initialPosts.filter((p) => getPostVideoUrl(p));
    const idx = vp.findIndex((p) => p.id === initialPostId);
    return idx >= 0 ? idx : 0;
  });
  const activeIndexRef = useRef(activeIndex);

  // ─── Video DOM refs ───────────────────────────────────────────────────────
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const isMutedRef = useRef(true); // always start muted (iOS autoplay requirement)

  const makeVideoRef = useCallback(
    (index: number) => (el: HTMLVideoElement | null) => {
      if (el) {
        videoRefs.current.set(index, el);
        // iOS Safari: muted attribute must be on the element, not just the property
        el.muted = true;
        el.setAttribute("muted", "");
      } else {
        videoRefs.current.delete(index);
      }
    },
    [],
  );

  // ─── Mute state — 2 state vars for the flash icon only ───────────────────
  const [isMutedState, setIsMutedState] = useState(true);
  const [muteFlashKey, setMuteFlashKey] = useState(0);

  // ─── Imperative play ─────────────────────────────────────────────────────
  const playVideo = useCallback((idx: number) => {
    const video = videoRefs.current.get(idx);
    if (!video) return;

    const muted = isMutedRef.current;
    video.muted = muted;
    if (muted) video.setAttribute("muted", "");
    else video.removeAttribute("muted");

    const tryPlay = () => {
      const p = video.play();
      if (p) {
        p.catch(() => {
          // Autoplay policy blocked — fallback to muted
          video.muted = true;
          video.setAttribute("muted", "");
          isMutedRef.current = true;
          setIsMutedState(true);
          void video.play().catch(() => {});
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      const onReady = () => { tryPlay(); video.removeEventListener("canplay", onReady); };
      video.addEventListener("canplay", onReady);
      // Fallback: try anyway after 1.5s
      setTimeout(() => {
        video.removeEventListener("canplay", onReady);
        if (video.paused) tryPlay();
      }, 1500);
    }
  }, []);

  const pauseAllExcept = useCallback((exceptIdx: number) => {
    videoRefs.current.forEach((video, idx) => {
      if (idx !== exceptIdx && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, []);

  // ─── Stable callback refs ─────────────────────────────────────────────────
  const visiblePostsRef = useRef(visiblePosts);
  visiblePostsRef.current = visiblePosts;
  const prevActiveRef = useRef(activeIndex);
  const onPostSeenRef = useRef(onPostSeen);
  onPostSeenRef.current = onPostSeen;
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const onNearCatalogEndRef = useRef(onNearCatalogEnd);
  onNearCatalogEndRef.current = onNearCatalogEnd;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const catalogCycleAtLengthRef = useRef(0);

  // ─── React to activeIndex change ──────────────────────────────────────────
  useEffect(() => {
    const prev = prevActiveRef.current;
    if (prev !== activeIndex) {
      const prevPost = visiblePostsRef.current[prev];
      if (prevPost) onPostSeenRef.current?.(prevPost.id);
      prevActiveRef.current = activeIndex;
    }
    activeIndexRef.current = activeIndex;

    pauseAllExcept(activeIndex);
    playVideo(activeIndex);
    onActiveChange?.(activeIndex);

    // Infinite scroll / catalog cycle
    const len = visiblePostsRef.current.length;
    if (activeIndex >= len - INFINITE_SCROLL_NEAR_END) {
      if (hasMoreRef.current) {
        onLoadMoreRef.current?.();
      } else if (onNearCatalogEndRef.current && catalogCycleAtLengthRef.current < len) {
        catalogCycleAtLengthRef.current = len;
        onNearCatalogEndRef.current();
      }
    }
  }, [activeIndex, pauseAllExcept, playVideo, onActiveChange]);

  // Mark current post seen on unmount
  useEffect(() => {
    return () => {
      const post = visiblePostsRef.current[prevActiveRef.current];
      if (post) onPostSeenRef.current?.(post.id);
    };
  }, []);

  // ─── Scroll → update activeIndex ─────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = el.clientHeight;
        if (h <= 0) return;
        const idx = Math.min(
          Math.round(el.scrollTop / h),
          visiblePostsRef.current.length - 1,
        );
        if (idx !== activeIndexRef.current) setActiveIndex(idx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // ─── Initial scroll to specific post ─────────────────────────────────────
  const initialScrollDone = useRef(false);
  useLayoutEffect(() => {
    if (initialScrollDone.current || !initialPostId || !containerRef.current) return;
    const idx = visiblePosts.findIndex((p) => p.id === initialPostId);
    if (idx > 0) {
      const el = containerRef.current;
      const snap = () => { const h = el.clientHeight; if (h > 0) el.scrollTop = idx * h; };
      snap();
      requestAnimationFrame(snap);
      setActiveIndex(idx);
    }
    initialScrollDone.current = true;
  }, [visiblePosts, initialPostId]);

  // ─── Reset scroll token ───────────────────────────────────────────────────
  const resetTokenRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (resetScrollToken === undefined) return;
    if (resetTokenRef.current === undefined) { resetTokenRef.current = resetScrollToken; return; }
    if (resetTokenRef.current === resetScrollToken) return;
    resetTokenRef.current = resetScrollToken;
    initialScrollDone.current = false;
    setActiveIndex(0);
    containerRef.current?.scrollTo({ top: 0 });
  }, [resetScrollToken]);

  // ─── Mute toggle ──────────────────────────────────────────────────────────
  const handleMuteToggle = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;

    const video = videoRefs.current.get(activeIndexRef.current);
    if (video) {
      video.muted = next;
      if (next) video.setAttribute("muted", "");
      else video.removeAttribute("muted");
    }

    setIsMutedState(next);
    setMuteFlashKey((k) => k + 1);
  }, []);

  // ─── Post management ──────────────────────────────────────────────────────
  const handlePostDeleted = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      onPostDeleted?.(postId);
    },
    [onPostDeleted],
  );

  // ─── Comment modal ────────────────────────────────────────────────────────
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialPosts.map((p) => [p.id, p.numComments ?? 0])),
  );
  const activeCommentPost = commentPostId
    ? visiblePosts.find((p) => p.id === commentPostId)
    : null;

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (!visiblePosts.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted">
        {t("noVideosYet")}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={setContainerRef} className="reels-shell-scroll">
      {visiblePosts.map((post, i) => {
        const dist = Math.abs(i - activeIndex);
        const key = postKeys?.[i] ?? post.id;

        return (
          <ReelSlide
            key={key}
            post={{ ...post, numComments: commentCounts[post.id] ?? post.numComments ?? 0 }}
            isActive={i === activeIndex}
            dist={dist}
            videoWindow={videoWindow}
            videoRefCallback={makeVideoRef(i)}
            onCommentClick={() => setCommentPostId(post.id)}
            onPostDeleted={() => handlePostDeleted(post.id)}
            onMuteToggle={handleMuteToggle}
            muteFlashKey={i === activeIndex ? muteFlashKey : 0}
            isMuted={isMutedState}
          />
        );
      })}

      {/* Guest upsell slide */}
      {guestPreview && videoPosts.length > 6 && (
        <div className="reels-slide flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-foreground">{t("guestReelsPreviewTitle")}</p>
          <p className="max-w-sm text-sm text-muted">{t("guestReelsPreviewDesc")}</p>
          <button
            type="button"
            onClick={() => router.push("/welcome?reason=auth-required")}
            className="rounded-2xl bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"
          >
            {t("loginWithGoogle")}
          </button>
        </div>
      )}

      {/* Load-more spinner */}
      {loadingMore && (
        <div className="reels-slide flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      )}

      {/* Comment modal */}
      {activeCommentPost && (
        <PostCommentModal
          postId={activeCommentPost.id}
          open={!!commentPostId}
          onClose={() => setCommentPostId(null)}
          initialCount={commentCounts[activeCommentPost.id] ?? activeCommentPost.numComments ?? 0}
          onCommentAdded={(count) =>
            setCommentCounts((prev) => ({ ...prev, [activeCommentPost.id]: count }))
          }
        />
      )}
    </div>
  );
}
