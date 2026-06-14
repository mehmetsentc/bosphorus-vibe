"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { useIntersectionActive } from "@/lib/hooks/useIntersectionActive";
import { useAdaptiveVideoSrc } from "@/lib/hooks/useAdaptiveVideoSrc";
import { useHideLikeCounts } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import {
  getPostCaption,
  getPostVideoUrl,
  incrementPostViews,
} from "@/lib/services/firestore";
import {
  followUser,
  unfollowUser,
} from "@/lib/services/friends";
import { getPostVideoPoster, pickImageSource, getVideoReelsPath, prewarmPostVideo } from "@/lib/utils/video-sources";
import { formatTimeAgo } from "@/lib/utils/time";
import {
  IconPlay,
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useT } from "@/components/providers/I18nProvider";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import { FEED_VIDEO_MOUNT_DEFER_MS } from "@/lib/performance/app-state";
import type { UserPostDoc } from "@/types";

// Heavy modals — lazy loaded only when opened
const PostCommentModal = dynamic(
  () => import("@/components/post/PostCommentModal").then((m) => ({ default: m.PostCommentModal })),
  { ssr: false },
);

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

const FEED_MEDIA_SIZES = "(max-width: 768px) 100vw, 470px";

type FeedPostCardProps = {
  post: EnrichedPost;
  followingIds?: Set<string>;
  onFollowChange?: (uid: string, following: boolean) => void;
  /** First visible card — eager-load poster for better LCP */
  priority?: boolean;
  /** Called once when the post leaves the viewport after being viewed */
  onPostSeen?: (postId: string) => void;
};

function FeedPostCardInner({
  post,
  followingIds,
  onFollowChange,
  priority = false,
  onPostSeen,
}: FeedPostCardProps) {
  const t = useT();
  const router = useRouter();
  const networkTier = useEffectiveNetworkTier();
  const { user } = useAuth();
  const { canLike } = useAccess();
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef(false);
  const wasActiveRef = useRef(false);
  const setFeedMuted = useVideoSoundStore((s) => s.setFeedMuted);
  const feedMuted = useVideoSoundStore((s) => s.feedMuted);
  const [isMuted, setIsMuted] = useState(feedMuted);
  const [mountVideo, setMountVideo] = useState(false);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);
  const [muteFlash, setMuteFlash] = useState<boolean | null>(null);
  const [showPoster, setShowPoster] = useState(true);   // true = video not yet playing
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [followBusy, setFollowBusy] = useState(false);
  const hideLikeCounts = useHideLikeCounts();
  const { ref, isActive } = useIntersectionActive<HTMLElement>({
    threshold: 0.55,
  });

  const video = getPostVideoUrl(post);
  const image = video ? "" : pickImageSource(post, "feed");
  const caption = getPostCaption(post);
  const {
    src: videoSrc,
    tier,
    onWaiting: handleAdaptiveWaiting,
    onPlaying: handleAdaptivePlaying,
    onError: handleAdaptiveError,
  } = useAdaptiveVideoSrc(post, "feed", isActive && mountVideo);
  const poster =
    getPostVideoPoster(post) || post.postVideothumbnail || undefined;
  const videoPreload = isActive ? getPreloadStrategy(tier, true) : "none";

  useEffect(() => {
    setShowPoster(true);
    setMountVideo(false);
  }, [videoSrc, post.id]);

  useEffect(() => {
    if (!isActive) {
      setMountVideo(false);
      return;
    }
    const delay = priority ? FEED_VIDEO_MOUNT_DEFER_MS : 0;
    const id = window.setTimeout(() => setMountVideo(true), delay);
    return () => window.clearTimeout(id);
  }, [isActive, priority]);

  useEffect(() => {
    setIsMuted(feedMuted);
  }, [feedMuted]);
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

  // Autoplay when scrolled into view
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video || !videoSrc || !mountVideo) return;
    if (isActive) {
      el.muted = feedMuted;
      if (feedMuted) el.setAttribute("muted", "");
      else el.removeAttribute("muted");
      setIsMuted(feedMuted);
      if (el.readyState === 0) el.load();
      el.play().catch(() => {
        if (!feedMuted) {
          el.muted = true;
          el.setAttribute("muted", "");
          setIsMuted(true);
        }
        el.play().catch(() => {
          const onCanPlay = () => el.play().catch(() => {});
          el.addEventListener("canplay", onCanPlay, { once: true });
        });
      });
      requestPlay(post.id);
    } else {
      el.pause();
      releasePlay(post.id);
      setShowPoster(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mountVideo, video, videoSrc, feedMuted, post.id, requestPlay, releasePlay]);

  // Increment view count once when post first enters viewport
  useEffect(() => {
    if (isActive && !viewedRef.current) {
      viewedRef.current = true;
      incrementPostViews(post.id);
    }
  }, [isActive, post.id]);

  // Mark as seen when user scrolls away (Instagram / TikTok-style)
  useEffect(() => {
    if (wasActiveRef.current && !isActive) {
      onPostSeen?.(post.id);
    }
    wasActiveRef.current = isActive;
  }, [isActive, post.id, onPostSeen]);

  // Prewarm + prefetch reels route while video is visible in feed
  useEffect(() => {
    if (!isActive || !video) return;
    prewarmPostVideo(post, networkTier);
    router.prefetch(getVideoReelsPath(post.id));
  }, [isActive, video, post, networkTier, router]);

  const openReels = useCallback(() => {
    if (!video) return;
    prewarmPostVideo(post, networkTier);
    router.push(getVideoReelsPath(post.id));
  }, [video, post, networkTier, router]);

  const handleVideoPointerDown = useCallback(() => {
    if (!video) return;
    prewarmPostVideo(post, networkTier);
  }, [video, post, networkTier]);

  // Mute button (top-right corner) — toggle sound only
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    setIsMuted(next);
    setFeedMuted(next);
    vid.muted = next;
    if (next) vid.setAttribute("muted", ""); else vid.removeAttribute("muted");
    setMuteFlash(!next);
    setTimeout(() => setMuteFlash(null), 700);
  }, [isMuted, setFeedMuted]);

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
      {/* Header */}
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

      {/* Media */}
      {video ? (
        <div className="relative w-full bg-black">
          <div className="relative aspect-square w-full overflow-hidden bg-black">
            {/* Thumbnail stays visible until the video actually plays */}
            {poster && (
              <div
                className={`absolute inset-0 z-[2] transition-opacity duration-150 ${
                  showPoster ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <OptimizedImage
                  src={poster}
                  alt=""
                  fill
                  sizes={FEED_MEDIA_SIZES}
                  priority={priority || isActive}
                  fetchPriority={priority ? "high" : undefined}
                  className="object-cover"
                />
              </div>
            )}

            {mountVideo && (
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              loop
              playsInline
              muted={isMuted}
              preload={videoPreload}
              className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-150 ${
                showPoster ? "opacity-0" : "opacity-100"
              }`}
              onPlaying={() => {
                handleAdaptivePlaying();
                setShowPoster(false);
              }}
              onPause={() => setShowPoster(true)}
              onWaiting={handleAdaptiveWaiting}
              onError={() => {
                if (handleAdaptiveError()) setShowPoster(true);
              }}
            />
            )}

            {/* Tap opens full-screen reels flow (Instagram-style) */}
            <button
              type="button"
              onPointerDown={handleVideoPointerDown}
              onClick={openReels}
              className="absolute inset-0 z-[1] bg-transparent"
              aria-label={t("navReels")}
            />

            {/* Play icon — only when scrolled away / paused (not during autoplay load) */}
            {showPoster && !isActive && (
              <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                  <IconPlay size={22} className="translate-x-0.5 text-white" />
                </div>
              </div>
            )}

            {/* Mute button — top-right, above tap area */}
            <button
              type="button"
              onClick={handleMuteToggle}
              className="absolute right-2 top-2 z-[10] flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
              aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
            >
              {isMuted
                ? <IconVolumeOff size={18} className="text-white" />
                : <IconVolumeOn  size={18} className="text-white" />
              }
            </button>

            {/* Mute flash feedback */}
            {muteFlash !== null && (
              <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60">
                  {muteFlash
                    ? <IconVolumeOn  size={28} className="text-white" />
                    : <IconVolumeOff size={28} className="text-white" />
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link href={`/post/${post.id}`} className="relative block w-full bg-black">
          <div className="relative aspect-square w-full overflow-hidden">
            {image && (
              <OptimizedImage
                src={image}
                alt={caption}
                fill
                sizes={FEED_MEDIA_SIZES}
                priority={priority}
                className="object-cover"
              />
            )}
          </div>
        </Link>
      )}

      {/* Actions */}
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
