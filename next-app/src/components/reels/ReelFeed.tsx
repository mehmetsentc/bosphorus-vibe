"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoFeedSideActions } from "@/components/video/VideoFeedSideActions";
import { PostCommentModal } from "@/components/post/PostCommentModal";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import { useReelsViewportHeight } from "@/lib/hooks/useReelsViewportHeight";
import { useT } from "@/components/providers/I18nProvider";
import { useNetworkQuality } from "@/lib/hooks/useNetworkQuality";
import { getPostVideoVariants } from "@/lib/utils/video-sources";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import type { UserPostDoc } from "@/types";

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

function ReelItem({
  post,
  isActive,
  onBecameActive,
  onPostDeleted,
}: {
  post: EnrichedPost;
  isActive: boolean;
  onBecameActive: () => void;
  onPostDeleted: () => void;
}) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const { ref } = useIntersectionActive<HTMLDivElement>({
    threshold: 0.72,
    onVisible: onBecameActive,
  });

  if (!getPostVideoUrl(post)) return null;

  const sideActions = (
    <VideoFeedSideActions
      post={{ ...post, numComments: commentCount }}
      onCommentClick={() => setCommentOpen(true)}
      onPostDeleted={onPostDeleted}
    />
  );

  return (
    <div ref={ref} className="reels-slide">
      <VideoPlayer
        post={post}
        isActive={isActive}
        overlay={isActive ? sideActions : undefined}
        showSeekBar={isActive}
      />
      <PostCommentModal
        postId={post.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        initialCount={commentCount}
        onCommentAdded={setCommentCount}
      />
    </div>
  );
}

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

  useEffect(() => {
    setPosts(initialPosts);
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
      if (
        hasMore &&
        !loadingMore &&
        onLoadMore &&
        index >= visiblePosts.length - 2
      ) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore, onActiveChange, visiblePosts.length],
  );

  if (!visiblePosts.length) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-muted">
        {t("noVideosYet")}
      </div>
    );
  }

  // Prefetch the next video's URL so it loads without waiting.
  // Only do this on fast connections to avoid wasting bandwidth.
  const nextPost = networkTier === "fast" ? visiblePosts[activeIndex + 1] : undefined;
  const nextSrc = nextPost
    ? (networkTier === "fast"
        ? getPostVideoVariants(nextPost).original
        : getPostVideoVariants(nextPost).low) || undefined
    : undefined;

  return (
    <div
      ref={containerRef}
      className="reels-shell-scroll"
    >
      {/* Prefetch next video — invisible, no autoplay */}
      {nextSrc && (
        <link rel="prefetch" href={nextSrc} as="video" />
      )}
      {visiblePosts.map((post, i) => (
        <ReelItem
          key={post.id}
          post={post}
          isActive={i === activeIndex}
          onBecameActive={() => handleActive(i)}
          onPostDeleted={() => handlePostDeleted(post.id)}
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
    </div>
  );
}
