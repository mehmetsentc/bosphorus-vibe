"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { getPostVideoPoster } from "@/lib/utils/video-sources";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoFeedSideActions } from "@/components/video/VideoFeedSideActions";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import { useReelsViewportHeight } from "@/lib/hooks/useReelsViewportHeight";
import { useT } from "@/components/providers/I18nProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { prewarmReelsPosts } from "@/lib/utils/video-sources";
import { REELS_VIDEO_WINDOW_RADIUS } from "@/lib/performance/app-state";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import type { UserPostDoc } from "@/types";

// Heavy modal — load only when first opened
const PostCommentModal = dynamic(
  () => import("@/components/post/PostCommentModal").then((m) => ({ default: m.PostCommentModal })),
  { ssr: false },
);

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

type ReelFeedProps = {
  posts: EnrichedPost[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onActiveChange?: (index: number) => void;
  onPostDeleted?: (postId: string) => void;
  guestPreview?: boolean;
  /** Scroll to this post on first render (e.g. when opening from feed) */
  initialPostId?: string;
  /** Called when user finishes watching a reel (swipes away) */
  onPostSeen?: (postId: string) => void;
  /** Exposes the scroll container for pull-to-refresh */
  scrollContainerRef?: MutableRefObject<HTMLDivElement | null>;
  /** Increment to scroll back to the first reel after refresh */
  resetScrollToken?: number;
};

// Memoized per-slide — only re-renders when isActive/isNext changes
const ReelItem = memo(function ReelItem({
  post,
  isActive,
  isNext,
  isNear,
  mountVideo,
  onBecameActive,
  onPostDeleted,
  onCommentClick,
}: {
  post: EnrichedPost;
  isActive: boolean;
  isNext: boolean;
  isNear: boolean;
  mountVideo: boolean;
  onBecameActive: () => void;
  onPostDeleted: () => void;
  onCommentClick: () => void;
}) {
  const { ref } = useIntersectionActive<HTMLDivElement>({
    threshold: 0.55,
    onVisible: onBecameActive,
  });

  if (!getPostVideoUrl(post)) return null;

  const slidePoster = getPostVideoPoster(post) ?? post.postVideothumbnail;

  const sideActions = (
    <VideoFeedSideActions
      post={post}
      onCommentClick={onCommentClick}
      onPostDeleted={onPostDeleted}
    />
  );

  return (
    <div ref={ref} className="reels-slide bg-black">
      {slidePoster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slidePoster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {mountVideo ? (
        <VideoPlayer
          post={post}
          isActive={isActive}
          isNext={isNext}
          isNear={isNear}
          playbackContext="reels"
          fit="cover"
          overlay={isActive ? sideActions : undefined}
          showSeekBar={isActive}
        />
      ) : (
        post.postVideothumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.postVideothumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        )
      )}
    </div>
  );
});

export function ReelFeed({
  posts: initialPosts,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
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
  const containerRef = useRef<HTMLDivElement | null>(null) as MutableRefObject<
    HTMLDivElement | null
  >;
  const resetTokenRef = useRef<number | undefined>(undefined);

  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      containerRef.current = el;
      if (scrollContainerRef) scrollContainerRef.current = el;
    },
    [scrollContainerRef],
  );

  useReelsViewportHeight(containerRef);
  const [posts, setPosts] = useState(initialPosts);

  const videoPosts = useMemo(
    () => posts.filter((p) => getPostVideoUrl(p)),
    [posts],
  );
  const visiblePosts = guestPreview ? videoPosts.slice(0, 6) : videoPosts;

  const [activeIndex, setActiveIndex] = useState(() => {
    if (!initialPostId) return 0;
    const idx = initialPosts
      .filter((p) => getPostVideoUrl(p))
      .findIndex((p) => p.id === initialPostId);
    return idx >= 0 ? idx : 0;
  });
  const initialScrollDone = useRef(false);
  const prevActiveIndexRef = useRef(activeIndex);
  const onPostSeenRef = useRef(onPostSeen);
  const visiblePostsRef = useRef(visiblePosts);
  onPostSeenRef.current = onPostSeen;
  visiblePostsRef.current = visiblePosts;

  // Single shared comment modal lifted out of N ReelItems
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialPosts.map((p) => [p.id, p.numComments])),
  );

  useEffect(() => {
    setPosts(initialPosts);
    setCommentCounts((prev) => {
      const next = { ...prev };
      initialPosts.forEach((p) => {
        if (!(p.id in next)) next[p.id] = p.numComments;
      });
      return next;
    });
  }, [initialPosts]);

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

  const handlePostDeleted = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      onPostDeleted?.(postId);
    },
    [onPostDeleted],
  );

  const handleActive = useCallback(
    (index: number) => {
      setActiveIndex(index);
      onActiveChange?.(index);
      // Trigger early — don't gate on loadingMore; the hook's own ref prevents doubles
    if (hasMore && onLoadMore && index >= visiblePosts.length - 3) {
        void onLoadMore();
      }
    },
    [hasMore, onLoadMore, onActiveChange, visiblePosts.length],
  );

  // Mark reel as seen when user swipes to the next one
  useEffect(() => {
    const prevIdx = prevActiveIndexRef.current;
    if (prevIdx !== activeIndex) {
      const prevPost = visiblePosts[prevIdx];
      if (prevPost) onPostSeenRef.current?.(prevPost.id);
      prevActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, visiblePosts]);

  useEffect(() => {
    return () => {
      const idx = prevActiveIndexRef.current;
      const current = visiblePostsRef.current[idx];
      if (current) onPostSeenRef.current?.(current.id);
    };
  }, []);

  // Prewarm before paint — current + next 2 reels
  useLayoutEffect(() => {
    const slice = visiblePosts.slice(
      Math.max(0, activeIndex - 1),
      activeIndex + 3,
    );
    prewarmReelsPosts(slice, networkTier);
  }, [activeIndex, visiblePosts, networkTier]);

  // Jump to tapped post before paint when opening from feed
  useLayoutEffect(() => {
    if (initialScrollDone.current || !initialPostId || !containerRef.current) return;
    const idx = visiblePosts.findIndex((p) => p.id === initialPostId);
    if (idx > 0) {
      containerRef.current.scrollTop = idx * containerRef.current.clientHeight;
      setActiveIndex(idx);
    }
    initialScrollDone.current = true;
  }, [visiblePosts, initialPostId]);

  // Extra prewarm when landing on a specific post from feed tap
  useEffect(() => {
    if (!initialPostId) return;
    const idx = visiblePosts.findIndex((p) => p.id === initialPostId);
    if (idx < 0) return;
    const toWarm = visiblePosts.slice(idx, idx + 3);
    prewarmReelsPosts(toWarm, networkTier);
  }, [initialPostId, visiblePosts, networkTier]);

  const openComment = useCallback((postId: string) => setCommentPostId(postId), []);
  const closeComment = useCallback(() => setCommentPostId(null), []);

  if (!visiblePosts.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted">
        {t("noVideosYet")}
      </div>
    );
  }

  const activeCommentPost = commentPostId
    ? visiblePosts.find((p) => p.id === commentPostId)
    : null;

  return (
    <div ref={setContainerRef} className="reels-shell-scroll">
      {visiblePosts.map((post, i) => (
        <ReelItem
          key={post.id}
          post={{ ...post, numComments: commentCounts[post.id] ?? post.numComments }}
          isActive={i === activeIndex}
          isNext={i === activeIndex + 1}
          isNear={false}
          mountVideo={Math.abs(i - activeIndex) <= REELS_VIDEO_WINDOW_RADIUS}
          onBecameActive={() => handleActive(i)}
          onPostDeleted={() => handlePostDeleted(post.id)}
          onCommentClick={() => openComment(post.id)}
        />
      ))}

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

      {loadingMore && (
        <div className="reels-slide flex h-24 items-center justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}

      {/* Single shared modal — not duplicated per slide */}
      {activeCommentPost && (
        <PostCommentModal
          postId={activeCommentPost.id}
          open={!!commentPostId}
          onClose={closeComment}
          initialCount={commentCounts[activeCommentPost.id] ?? activeCommentPost.numComments}
          onCommentAdded={(count) =>
            setCommentCounts((prev) => ({ ...prev, [activeCommentPost.id]: count }))
          }
        />
      )}
    </div>
  );
}
