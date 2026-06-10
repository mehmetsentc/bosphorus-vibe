"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import {
  useEffectiveNetworkTier,
  useHideLikeCounts,
} from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import {
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
  incrementPostViews,
} from "@/lib/services/firestore";
import {
  followUser,
  getFollowingSet,
  unfollowUser,
} from "@/lib/services/friends";
import { pickImageSource, pickVideoSource } from "@/lib/utils/video-sources";
import { formatTimeAgo } from "@/lib/utils/time";
import { IconVolumeOff, IconVolumeOn } from "@/components/icons/Icons";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { useT } from "@/components/providers/I18nProvider";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

// Heavy modals — lazy loaded only when opened
const PostCommentModal = dynamic(
  () => import("@/components/post/PostCommentModal").then((m) => ({ default: m.PostCommentModal })),
  { ssr: false },
);

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

const DOUBLE_TAP_MS = 280;

type FeedPostCardProps = {
  post: EnrichedPost;
  followingIds?: Set<string>;
  onFollowChange?: (uid: string, following: boolean) => void;
};

function FeedPostCardInner({
  post,
  followingIds,
  onFollowChange,
}: FeedPostCardProps) {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const { canLike } = useAccess();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewedRef = useRef(false); // fire view count once per mount
  const muted = useVideoSoundStore((s) => s.feedMuted);
  const setFeedMuted = useVideoSoundStore((s) => s.setFeedMuted);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);
  const [muteFlash, setMuteFlash] = useState<boolean | null>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [followBusy, setFollowBusy] = useState(false);
  const tier = useEffectiveNetworkTier();
  const hideLikeCounts = useHideLikeCounts();
  const { ref, isActive } = useIntersectionActive<HTMLElement>({
    threshold: 0.55,
  });

  const video = getPostVideoUrl(post);
  // Feed always uses low-quality image for fast scrolling
  const image = video ? "" : pickImageSource(post, "feed");
  const caption = getPostCaption(post);
  const videoSrc = video ? pickVideoSource(post, tier, "feed").src : "";
  const poster = post.postVideothumbnail || pickImageSource(post, "feed") || undefined;
  const videoPreload = getPreloadStrategy(tier, isActive);
  const isOwn = user?.uid === post.postUserId;
  const isFollowing = post.postUserId
    ? followingIds?.has(post.postUserId)
    : false;

  // Global singleton: pause this video when another one starts playing
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;
    if (playingId !== null && playingId !== post.id) {
      el.pause();
    }
  }, [playingId, video, post.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video) return;
    if (isActive) {
      el.play().catch(() => {});
      requestPlay(post.id);
    } else {
      el.pause();
      releasePlay(post.id);
      setShowPoster(true);
    }
  }, [isActive, video, videoSrc, post.id, requestPlay, releasePlay]);

  // Increment view count once when post first enters viewport
  useEffect(() => {
    if (isActive && !viewedRef.current) {
      viewedRef.current = true;
      incrementPostViews(post.id);
    }
  }, [isActive, post.id]);

  useEffect(
    () => () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    },
    [],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    setFeedMuted(next);
    const vid = videoRef.current;
    if (vid) {
      // Imperative DOM update — React prop alone doesn't unmute on iOS Safari.
      vid.muted = next;
      // Re-trigger play so iOS commits the new audio state within the gesture handler.
      if (!next) vid.play().catch(() => {});
    }
    setMuteFlash(!next);
    setTimeout(() => setMuteFlash(null), 700);
  }, [muted, setFeedMuted]);

  // Single tap → open scrollable feed view starting at this post
  // Double tap → toggle mute/unmute
  const handleVideoMediaClick = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      // Double tap → toggle sound
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      lastTapRef.current = 0;
      toggleMute();
      return;
    }
    lastTapRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      // Single tap → open swipeable feed view
      router.push(`/feed/${post.id}`);
    }, DOUBLE_TAP_MS);
  }, [post.id, router, toggleMute]);

  async function handleFollow() {
    if (!canLike || !user || !post.postUserId || isOwn) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, post.postUserId);
        onFollowChange?.(post.postUserId, false);
      } else {
        await followUser(user.uid, post.postUserId);
        onFollowChange?.(post.postUserId, true);
      }
    } finally {
      setFollowBusy(false);
    }
  }

  return (
    <article ref={ref} className="border-b border-border bg-background">
      <div className="flex items-center gap-2.5 px-3 py-2">
        <Link
          href={post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {post.userPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.userPhoto}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-bold text-gold">
              {(post.userName ?? "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight">
              {post.userName ?? "user"}
            </p>
            <p className="truncate text-[11px] text-muted">
              {post.activityName
                ? `${post.activityName} · ${formatTimeAgo(post.timePosted)}`
                : formatTimeAgo(post.timePosted)}
            </p>
          </div>
        </Link>

        {!isOwn && post.postUserId && canLike && (
          <button
            type="button"
            disabled={followBusy}
            onClick={handleFollow}
            className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              isFollowing
                ? "bg-surface-overlay text-muted"
                : "bg-surface-overlay text-foreground hover:bg-surface-card"
            }`}
          >
            {isFollowing ? t("unfollow") : t("follow")}
          </button>
        )}

        <Link
          href={`/post/${post.id}`}
          className="shrink-0 p-1 text-lg leading-none text-muted"
          aria-label={t("menu")}
        >
          ···
        </Link>
      </div>

      {video ? (
        <button
          type="button"
          onClick={handleVideoMediaClick}
          className="relative block w-full bg-black"
          aria-label={t("videoControl")}
        >
          <div className="relative aspect-square w-full overflow-hidden">
            {/* Poster shown until video starts playing */}
            {showPoster && poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              poster={poster}
              muted={muted}
              loop
              playsInline
              preload={videoPreload}
              className="h-full w-full object-cover"
              onPlaying={() => setShowPoster(false)}
              onPause={() => setShowPoster(true)}
            />
            {muteFlash !== null && (
              <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                <div className="action-icon-btn h-16 w-16">
                  {muteFlash ? (
                    <IconVolumeOn size={28} className="text-vibe" />
                  ) : (
                    <IconVolumeOff size={28} className="text-muted" />
                  )}
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        <Link href={`/post/${post.id}`} className="relative block w-full bg-black">
          <div className="relative aspect-square w-full overflow-hidden">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={caption}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Link>
      )}

      <PostActionsBar
        post={{ ...post, numComments: commentCount, likedByIds: post.likedByIds }}
        onCommentClick={() => setCommentOpen(true)}
        onLikeCountChange={setLikeCount}
        compact
        hideCommentPreview
      />

      <div className="space-y-1 px-3 pb-4">
        <div className="flex items-center gap-3">
          {likeCount > 0 && !hideLikeCounts && (
            <p className="text-[13px] font-semibold">
              {likeCount} {t("likes")}
            </p>
          )}
          {(post.numViews ?? 0) > 0 && (
            <p className="text-[12px] text-muted">
              {(post.numViews ?? 0).toLocaleString()} görüntülenme
            </p>
          )}
        </div>
        {caption && (
          <p className="text-[13px] leading-snug">
            <Link
              href={post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`}
              className="mr-1.5 font-semibold hover:underline"
            >
              {post.userName ?? "user"}
            </Link>
            <span className="text-foreground/90">{caption}</span>
          </p>
        )}
        {post.taggedPeople && post.taggedPeople.length > 0 && (
          <PostTaggedPeople
            tags={post.taggedPeople}
            className="text-[13px] leading-snug"
          />
        )}
        {commentCount > 0 && (
          <button
            type="button"
            onClick={() => setCommentOpen(true)}
            className="text-[13px] text-muted hover:text-foreground"
          >
            {t("viewAllComments", { count: String(commentCount) })}
          </button>
        )}
      </div>

      <PostCommentModal
        postId={post.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        initialCount={commentCount}
        onCommentAdded={setCommentCount}
      />
    </article>
  );
}

export const FeedPostCard = memo(FeedPostCardInner);
