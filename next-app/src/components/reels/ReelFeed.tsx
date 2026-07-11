"use client";

/**
 * ReelFeed — Tam yeniden tasarım (v3)
 *
 * Çözülen sorunlar:
 *  1. Stabil video ref callback'leri — her render'da yeni fonksiyon oluşturulmuyor,
 *     bu yüzden React video elementini temizleyip yeniden mount etmiyor.
 *  2. "Play on mount" — video element DOM'a eklendiğinde aktif slot ise hemen oynatılıyor.
 *  3. Ses: kalıcı mute ikonu, action butonlarda event.stopPropagation().
 *  4. src asla silinmiyor — buffer bellekte kalıyor.
 *  5. preload="auto" ±videoWindow slide için — tarayıcı arka planda yüklüyor.
 *  6. Tek React state (activeIndex) — scroll'da sıfır re-render.
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
import { getPostVideoPoster, prewarmReelsPosts } from "@/lib/utils/video-sources";
import { ReelSlideVideo } from "@/components/reels/ReelSlideVideo";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import {
  cancelVideoPrefetchesExcept,
  setReelPrefetchScope,
} from "@/lib/performance/video-prefetch-manager";
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
  () =>
    import("@/components/post/PostCommentModal").then((m) => ({
      default: m.PostCommentModal,
    })),
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

// ─── Mute icon — kalıcı görünür, toggle'da flash ─────────────────────────────

function MuteBtn({
  muted,
  flashKey,
  onToggle,
}: {
  muted: boolean;
  flashKey: number;
  onToggle: () => void;
}) {
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (flashKey === 0) return;
    setFlashing(true);
    const t = setTimeout(() => setFlashing(false), 700);
    return () => clearTimeout(t);
  }, [flashKey]);

  return (
    <button
      type="button"
      aria-label={muted ? "Sesi aç" : "Sesi kapat"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`absolute right-4 top-4 z-20 rounded-full p-2 transition-all duration-300
        ${flashing ? "scale-125 bg-white/20" : "bg-black/30 hover:bg-black/50"}`}
    >
      {muted ? (
        <IconVolumeOff size={20} className="text-white" />
      ) : (
        <IconVolumeOn size={20} className="text-white" />
      )}
    </button>
  );
}

// ─── Per-slide — memo: sadece props değişince render ─────────────────────────

type ReelSlideProps = {
  post: EnrichedPost;
  isActive: boolean;
  dist: number;
  videoWindow: number;
  /** Stabil ref callback — her render'da DEĞİŞMEMELİ */
  videoRef: (el: HTMLVideoElement | null) => void;
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
  videoRef,
  onCommentClick,
  onPostDeleted,
  onMuteToggle,
  muteFlashKey,
  isMuted,
}: ReelSlideProps) {
  const poster = getPostVideoPoster(post) ?? post.postVideothumbnail ?? undefined;

  const mountVideo = dist <= videoWindow;
  const showPoster = !mountVideo && dist <= REELS_DOM_WINDOW_RADIUS && !!poster;
  const preload: "auto" | "metadata" | "none" = !mountVideo
    ? "none"
    : isActive || dist === 1
      ? "auto"
      : "metadata";

  return (
    // Tüm slidelarda div her zaman DOM'da — scroll-snap için zorunlu
    <div
      className="reels-slide relative bg-black"
      onClick={isActive ? onMuteToggle : undefined}
    >
      {showPoster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}

      {mountVideo && (
        <ReelSlideVideo
          post={post}
          shouldLoad={mountVideo}
          isActive={isActive}
          preload={preload}
          videoRef={videoRef}
        />
      )}

      {/* Aktif slide overlayleri */}
      {isActive && (
        <>
          {/* Action butonları — stopPropagation içerde, mute toggle etkilemiyor */}
          <div onClick={(e) => e.stopPropagation()}>
            <VideoFeedSideActions
              post={post}
              onCommentClick={onCommentClick}
              onPostDeleted={onPostDeleted}
            />
          </div>

          {/* Ses butonu — her zaman görünür, toggle'da flash */}
          <MuteBtn
            muted={isMuted}
            flashKey={muteFlashKey}
            onToggle={onMuteToggle}
          />
        </>
      )}
    </div>
  );
});

// ─── Ana Feed ─────────────────────────────────────────────────────────────────

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
  const networkTier = useEffectiveNetworkTier();
  const reelsMuted = useVideoSoundStore((s) => s.reelsMuted);
  const setReelsMuted = useVideoSoundStore((s) => s.setReelsMuted);

  // Cihaz tipine göre video window (iOS: 1, Android/desktop: 2)
  const videoWindow = useMemo(() => {
    if (typeof window === "undefined") return 1;
    return getReelsVideoWindowRadius();
  }, []);

  // ─── Container ref ───────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement | null>(null) as MutableRefObject<HTMLDivElement | null>;
  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (scrollContainerRef) scrollContainerRef.current = el;
    },
    [scrollContainerRef],
  );
  useReelsViewportHeight(containerRef);

  // ─── Posts ───────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState(initialPosts);
  useEffect(() => {
    setPosts(initialPosts);
    setCommentCounts((prev) => {
      const next = { ...prev };
      initialPosts.forEach((p) => {
        if (!(p.id in next)) next[p.id] = p.numComments ?? 0;
      });
      return next;
    });
  }, [initialPosts]);

  const videoPosts = useMemo(() => posts.filter((p) => getPostVideoUrl(p)), [posts]);
  const visiblePosts = guestPreview ? videoPosts.slice(0, 6) : videoPosts;
  const visiblePostsRef = useRef(visiblePosts);
  visiblePostsRef.current = visiblePosts;

  // ─── Tek React state: aktif slide indeksi ────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(() => {
    if (!initialPostId) return 0;
    const vp = initialPosts.filter((p) => getPostVideoUrl(p));
    const idx = vp.findIndex((p) => p.id === initialPostId);
    return idx >= 0 ? idx : 0;
  });
  const activeIndexRef = useRef(activeIndex);

  // ─── Video DOM map ────────────────────────────────────────────────────────
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // ─── Mute — store + ref (autoplay policy) ────────────────────────────────
  const isMutedRef = useRef(reelsMuted);
  const [isMutedState, setIsMutedState] = useState(reelsMuted);
  const [muteFlashKey, setMuteFlashKey] = useState(0);

  useEffect(() => {
    isMutedRef.current = reelsMuted;
    setIsMutedState(reelsMuted);
    const video = videoRefs.current.get(activeIndexRef.current);
    if (video) {
      video.muted = reelsMuted;
      if (reelsMuted) video.setAttribute("muted", "");
      else video.removeAttribute("muted");
    }
  }, [reelsMuted]);

  // ─── playVideo — stabil, ref ile erişilir ────────────────────────────────
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
          // Autoplay politikası engelledi — muted'a geri dön
          video.muted = true;
          video.setAttribute("muted", "");
          isMutedRef.current = true;
          setIsMutedState(true);
          void video.play().catch(() => {/* tamamen başarısız */});
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      const handler = () => {
        tryPlay();
        video.removeEventListener("canplay", handler);
      };
      video.addEventListener("canplay", handler);
      // 2 saniye fallback
      setTimeout(() => {
        video.removeEventListener("canplay", handler);
        if (video.paused) tryPlay();
      }, 2000);
    }
  }, []);

  const playVideoRef = useRef(playVideo);
  playVideoRef.current = playVideo;

  const pauseAllExcept = useCallback((exceptIdx: number) => {
    videoRefs.current.forEach((video, idx) => {
      if (idx !== exceptIdx && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, []);

  // ─── STABİL video ref callback'leri — her index için bir kez oluşturulur ─
  //     Bu kritik: callback değişirse React null → element sırası ile çağırır
  //     ve video elementi yeniden monte edilir (buffered data kaybolur).
  const stableVideoCallbacks = useRef<Map<number, (el: HTMLVideoElement | null) => void>>(
    new Map(),
  );

  const getVideoRef = useCallback((index: number) => {
    if (!stableVideoCallbacks.current.has(index)) {
      stableVideoCallbacks.current.set(index, (el: HTMLVideoElement | null) => {
        if (el) {
          videoRefs.current.set(index, el);
          const muted = isMutedRef.current;
          el.muted = muted;
          if (muted) el.setAttribute("muted", "");
          else el.removeAttribute("muted");
          // Bu video aktif slotsa, hemen oynat
          if (index === activeIndexRef.current) {
            playVideoRef.current(index);
          }
        } else {
          videoRefs.current.delete(index);
        }
      });
    }
    return stableVideoCallbacks.current.get(index)!;
  }, []);

  // ─── activeIndex değişince: durdur / oynat ───────────────────────────────
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

    // Infinite scroll
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

  // Scroll-ahead prewarm: active + next two clips
  useLayoutEffect(() => {
    const current = visiblePostsRef.current[activeIndex];
    const next = visiblePostsRef.current[activeIndex + 1];
    const nextNext = visiblePostsRef.current[activeIndex + 2];
    setReelPrefetchScope(current?.id, next?.id, nextNext?.id);
    cancelVideoPrefetchesExcept([]);
    prewarmReelsPosts(
      [current, next, nextNext].filter(Boolean) as typeof visiblePosts,
      networkTier,
    );
    return () => setReelPrefetchScope();
  }, [activeIndex, visiblePosts, networkTier]);

  useEffect(() => {
    return () => {
      const post = visiblePostsRef.current[prevActiveRef.current];
      if (post) onPostSeenRef.current?.(post.id);
    };
  }, []);

  // ─── Scroll → activeIndex ─────────────────────────────────────────────────
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
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ─── initialPostId → scroll ───────────────────────────────────────────────
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

  // ─── Reset token ──────────────────────────────────────────────────────────
  const resetTokenRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (resetScrollToken === undefined) return;
    if (resetTokenRef.current === undefined) {
      resetTokenRef.current = resetScrollToken;
      return;
    }
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
    setReelsMuted(next);

    const video = videoRefs.current.get(activeIndexRef.current);
    if (video) {
      video.muted = next;
      if (next) video.setAttribute("muted", "");
      else video.removeAttribute("muted");
    }

    setIsMutedState(next);
    setMuteFlashKey((k) => k + 1);
  }, [setReelsMuted]);

  // ─── Post silme ───────────────────────────────────────────────────────────
  const handlePostDeleted = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      onPostDeleted?.(postId);
    },
    [onPostDeleted],
  );

  // ─── Yorum modal ──────────────────────────────────────────────────────────
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
        const isActive = i === activeIndex;

        return (
          <ReelSlide
            key={key}
            post={{ ...post, numComments: commentCounts[post.id] ?? post.numComments ?? 0 }}
            isActive={isActive}
            dist={dist}
            videoWindow={videoWindow}
            videoRef={getVideoRef(i)}
            onCommentClick={() => setCommentPostId(post.id)}
            onPostDeleted={() => handlePostDeleted(post.id)}
            onMuteToggle={handleMuteToggle}
            muteFlashKey={isActive ? muteFlashKey : 0}
            isMuted={isMutedState}
          />
        );
      })}

      {/* Guest upsell */}
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

      {/* Load-more göstergesi */}
      {loadingMore && (
        <div className="reels-slide flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      )}

      {/* Yorum modal */}
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
