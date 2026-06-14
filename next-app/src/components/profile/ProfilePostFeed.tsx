"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { ReelsShell } from "@/components/reels/ReelsShell";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { getPostVideoPoster, pickVideoSource, prewarmVideoUrls } from "@/lib/utils/video-sources";
import { REELS_VIDEO_WINDOW_RADIUS } from "@/lib/performance/app-state";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoFeedSideActions } from "@/components/video/VideoFeedSideActions";
import { PostCommentModal } from "@/components/post/PostCommentModal";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import { useReelsViewportHeight } from "@/lib/hooks/useReelsViewportHeight";
import { useT } from "@/components/providers/I18nProvider";
import { getPostCaption, getPostImageUrl } from "@/lib/services/firestore";
import type { UserPostDoc } from "@/types";

export type EnrichedProfilePost = UserPostDoc & {
  userName?: string;
  userPhoto?: string;
};

type ProfilePostFeedProps = {
  posts: EnrichedProfilePost[];
  initialPostId: string;
  backHref: string;
  onPostsChange?: (posts: EnrichedProfilePost[]) => void;
};

function ProfileFeedItem({
  post,
  isActive,
  isNext,
  isNear,
  mountVideo,
  onBecameActive,
  onPostDeleted,
}: {
  post: EnrichedProfilePost;
  isActive: boolean;
  isNext: boolean;
  isNear: boolean;
  mountVideo: boolean;
  onBecameActive: () => void;
  onPostDeleted: () => void;
}) {
  const t = useT();
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const videoUrl = getPostVideoUrl(post);
  const imageUrl = getPostImageUrl(post);
  const slidePoster = getPostVideoPoster(post) ?? post.postVideothumbnail;
  const { ref } = useIntersectionActive<HTMLDivElement>({
    threshold: 0.72,
    onVisible: onBecameActive,
  });

  const sideActions = isActive ? (
    <VideoFeedSideActions
      post={{ ...post, numComments: commentCount }}
      onCommentClick={() => setCommentOpen(true)}
      onPostDeleted={onPostDeleted}
    />
  ) : undefined;

  return (
    <div ref={ref} className="reels-slide bg-black">
      {slidePoster && videoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slidePoster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {videoUrl ? (
        mountVideo ? (
        <VideoPlayer
          post={post}
          isActive={isActive}
          isNext={isNext}
          isNear={isNear}
          fit="cover"
          overlay={sideActions}
          showSeekBar={isActive}
        />
        ) : null
      ) : imageUrl ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={getPostCaption(post)}
            className="max-h-full max-w-full object-contain"
          />
          {sideActions}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-muted">
          {t("noContent")}
        </div>
      )}

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

export function ProfilePostFeed({
  posts: initialPosts,
  initialPostId,
  backHref,
  onPostsChange,
}: ProfilePostFeedProps) {
  const t = useT();
  const router = useRouter();
  const networkTier = useEffectiveNetworkTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideHeight = useReelsViewportHeight(containerRef);
  const [posts, setPosts] = useState(initialPosts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const initialIndex = posts.findIndex((p) => p.id === initialPostId);

  useLayoutEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handlePostDeleted = useCallback(
    (postId: string) => {
      setPosts((prev) => {
        const next = prev.filter((p) => p.id !== postId);
        onPostsChange?.(next);
        if (!next.length) router.replace(backHref);
        return next;
      });
    },
    [backHref, onPostsChange, router],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    const h = slideHeight || el?.clientHeight || 0;
    if (!el || scrolled || initialIndex <= 0 || h <= 0) return;
    el.scrollTop = initialIndex * h;
    setActiveIndex(initialIndex);
    setScrolled(true);
  }, [initialIndex, scrolled, posts.length, slideHeight]);

  const handleActive = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const current = posts[activeIndex];
    const next = posts[activeIndex + 1];
    const urls = [current, next]
      .filter(Boolean)
      .map((p) => pickVideoSource(p, networkTier, "feed").src)
      .filter(Boolean);
    prewarmVideoUrls(urls);
  }, [activeIndex, posts, networkTier]);

  if (!posts.length) {
    return (
      <ReelsShell backHref={backHref}>
        <div className="reels-shell-scroll flex items-center justify-center text-muted">
          {t("noContentInTab")}
        </div>
      </ReelsShell>
    );
  }

  return (
    <ReelsShell backHref={backHref}>
      <div ref={containerRef} className="reels-shell-scroll">
        {posts.map((post, i) => (
          <ProfileFeedItem
            key={post.id}
            post={post}
            isActive={i === activeIndex}
            isNext={i === activeIndex + 1}
            isNear={Math.abs(i - activeIndex) === 2}
            mountVideo={Math.abs(i - activeIndex) <= REELS_VIDEO_WINDOW_RADIUS}
            onBecameActive={() => handleActive(i)}
            onPostDeleted={() => handlePostDeleted(post.id)}
          />
        ))}
      </div>
    </ReelsShell>
  );
}
