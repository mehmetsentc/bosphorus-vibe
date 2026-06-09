"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoFeedSideActions } from "@/components/video/VideoFeedSideActions";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import { useReelsViewportHeight } from "@/lib/hooks/useReelsViewportHeight";
import { useT } from "@/components/providers/I18nProvider";
import { useNetworkQuality } from "@/lib/hooks/useNetworkQuality";
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
};

// Memoized per-slide — only re-renders when isActive/isNext changes
const ReelItem = memo(function ReelItem({
  post,
  isActive,
  isNext,
  onBecameActive,
  onPostDeleted,
  onCommentClick,
}: {
  post: EnrichedPost;
  isActive: boolean;
  isNext: boolean;
  onBecameActive: () => void;
  onPostDeleted: () => void;
  onCommentClick: () => void;
}) {
  const { ref } = useIntersectionActive<HTMLDivElement>({
    threshold: 0.72,
    onVisible: onBecameActive,
  });

  if (!getPostVideoUrl(post)) return null;

  const sideActions = (
    <VideoFeedSideActions
      post={post}
      onCommentClick={onCommentClick}
      onPostDeleted={onPostDeleted}
    />
  );

  return (
    <div ref={ref} className="reels-slide">
      <VideoPlayer
        post={post}
        isActive={isActive}
        isNext={isNext}
        overlay={isActive ? sideActions : undefined}
        showSeekBar={isActive}
      />
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
}: ReelFeedProps) {
  const t = useT();
  const router = useRouter();
  const networkTier = useNetworkQuality();
  const containerRef = useRef<HTMLDivElement>(null);
  useReelsViewportHeight(containerRef);
  const [posts, setPosts] = useState(initialPosts);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const videoPosts = posts.filter((p) => getPostVideoUrl(p));
  const visiblePosts = guestPreview ? videoPosts.slice(0, 6) : videoPosts;

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
      if (hasMore && !loadingMore && onLoadMore && index >= visiblePosts.length - 2) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore, onActiveChange, visiblePosts.length],
  );

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
    <div ref={containerRef} className="reels-shell-scroll">
      {visiblePosts.map((post, i) => (
        <ReelItem
          key={post.id}
          post={{ ...post, numComments: commentCounts[post.id] ?? post.numComments }}
          isActive={i === activeIndex}
          isNext={i === activeIndex + 1 && networkTier === "fast"}
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
