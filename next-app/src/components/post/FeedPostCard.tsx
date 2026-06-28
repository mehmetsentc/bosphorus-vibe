"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { useFeedVideoVisibility } from "@/lib/hooks/useFeedVideoVisibility";
import { useAdaptiveVideoSrc } from "@/lib/hooks/useAdaptiveVideoSrc";
import { useHideLikeCounts } from "@/lib/hooks/useSettingsEffects";
import {
  getPostCaption,
  getPostVideoUrl,
  incrementPostViews,
} from "@/lib/services/firestore";
import {
  followUser,
  unfollowUser,
} from "@/lib/services/friends";
import {
  getPostFeedImageCandidates,
  getPostFeedThumbnailCandidates,
  getFastFlowPlaybackUrl,
  getVideoReelsPath,
  pickImageSource,
  prewarmReelsPost,
  prefetchImageUrl,
} from "@/lib/utils/video-sources";
import {
  FEED_POSTER_PREFETCH_MAX,
  FEED_VIDEO_ASPECT_CLASS,
} from "@/lib/performance/app-state";
import { formatTimeAgo } from "@/lib/utils/time";
import {
  IconPlay,
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { FeedMediaImage } from "@/components/post/FeedMediaImage";
import { FeedVideoPoster } from "@/components/post/FeedVideoPoster";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

// Heavy modals — lazy loaded only when opened
const PostCommentModal = dynamic(
  () => import("@/components/post/PostCommentModal").then((m) => ({ default: m.PostCommentModal })),
  { ssr: false },
);

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

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
  const { locale } = useI18n();
  const router = useRouter();
  const networkTier = useEffectiveNetworkTier();
  const { user } = useAuth();
  const { canLike } = useAccess();
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef(false);
  const wasActiveRef = useRef(false);
  const feedMuted = useVideoSoundStore((s) => s.feedMuted);
  const setReelsMuted = useVideoSoundStore((s) => s.setReelsMuted);
  const [isMuted, setIsMuted] = useState(feedMuted);
  const [mountVideo, setMountVideo] = useState(priority);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);
  const [muteFlash, setMuteFlash] = useState<boolean | null>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [followBusy, setFollowBusy] = useState(false);
  const hideLikeCounts = useHideLikeCounts();
  const { ref, isActive, isNear } = useFeedVideoVisibility<HTMLDivElement>(post.id);

  const video = getPostVideoUrl(post);
  const imageCandidates = useMemo(
    () => getPostFeedImageCandidates(post),
    [post],
  );
  const image = video ? "" : pickImageSource(post, "feed");
  const caption = getPostCaption(post, locale);

  useEffect(() => {
    if (priority || isNear || isActive) {
      setMountVideo(true);
    } else {
      setMountVideo(false);
    }
  }, [priority, isNear, isActive]);

  const {
    src: videoSrc,
    onWaiting: handleAdaptiveWaiting,
    onPlaying: handleAdaptivePlaying,
    onError: handleAdaptiveError,
  } = useAdaptiveVideoSrc(post, "feed", Boolean(mountVideo && isActive));

  const videoSrcResolved =
    videoSrc ||
    (mountVideo && isActive ? getFastFlowPlaybackUrl(post) : "");
  const thumbCandidates = useMemo(
    () => getPostFeedThumbnailCandidates(post),
    [post],
  );
  const videoPreload = isActive || isNear ? "auto" : "none";

  useEffect(() => {
    setShowPoster(true);
  }, [videoSrcResolved, post.id]);

  // Prefetch poster early so feed never flashes black
  useEffect(() => {
    if (!video || !isNear && !isActive && !priority) return;
    for (const url of thumbCandidates.slice(0, FEED_POSTER_PREFETCH_MAX)) {
      prefetchImageUrl(url);
    }
  }, [video, thumbCandidates, post.id, isNear, isActive, priority]);

  useEffect(() => {
    if (!video) return;
    for (const url of imageCandidates.slice(0, 3)) {
      prefetchImageUrl(url);
    }
  }, [video, imageCandidates, post.id]);

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

  // Autoplay only when this card wins visibility (Instagram-style single active video)
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video || !videoSrcResolved || !mountVideo) return;

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
      return;
    }

    el.pause();
    el.currentTime = 0;
    releasePlay(post.id);
    setShowPoster(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mountVideo, video, videoSrcResolved, feedMuted, post.id, requestPlay, releasePlay]);

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
    prewarmReelsPost(post, networkTier);
    router.prefetch(getVideoReelsPath(post.id));
  }, [isActive, video, post, networkTier, router]);

  const openReels = useCallback(() => {
    if (!video) return;
    setReelsMuted(false);
    prewarmReelsPost(post, networkTier);
    router.push(getVideoReelsPath(post.id));
  }, [video, post, networkTier, router, setReelsMuted]);

  const handleVideoPointerDown = useCallback(() => {
    if (!video) return;
    prewarmReelsPost(post, networkTier);
  }, [video, post, networkTier]);

  // Mute button (top-right corner) — toggle sound only
  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    setIsMuted(next);
    vid.muted = next;
    if (next) vid.setAttribute("muted", ""); else vid.removeAttribute("muted");
    setMuteFlash(!next);
    setTimeout(() => setMuteFlash(null), 700);
  }, [isMuted]);

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
    <article className="border-b border-border bg-background">
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
            <p className="truncate text-xs text-muted">
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
          <div
            ref={ref}
            className={`relative ${FEED_VIDEO_ASPECT_CLASS} w-full overflow-hidden bg-black`}
          >
            {/* Poster always visible until video plays */}
            <div
              className={`absolute inset-0 z-[4] transition-opacity duration-150 ${
                showPoster ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <FeedVideoPoster
                post={post}
                priority={priority || isActive}
              />
            </div>

            {mountVideo && videoSrcResolved && (
            <video
              ref={videoRef}
              key={`${post.id}-${videoSrcResolved}`}
              data-feed-video-id={post.id}
              src={videoSrcResolved}
              loop
              playsInline
              {...({ webkitPlaysinline: "true" } as Record<string, string>)}
              muted={isMuted}
              preload={videoPreload}
              className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-150 ${
                showPoster ? "opacity-0" : "opacity-100"
              }`}
              onCanPlay={() => {
                const el = videoRef.current;
                if (isActive && el?.paused) {
                  el.play().catch(() => {});
                }
              }}
              onLoadedData={() => {
                const el = videoRef.current;
                if (isActive && el?.paused) {
                  el.play().catch(() => {});
                }
              }}
              onPlaying={() => {
                handleAdaptivePlaying();
                const el = videoRef.current;
                if (el && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                  setShowPoster(false);
                }
              }}
              onTimeUpdate={(e) => {
                if (showPoster && e.currentTarget.currentTime > 0.05) {
                  setShowPoster(false);
                }
              }}
              onPause={() => {
                if (!isActive) setShowPoster(true);
              }}
              onWaiting={() => {
                handleAdaptiveWaiting();
              }}
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
              className="absolute inset-0 z-[5] bg-transparent"
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

            {/* Mute — bottom-right (Instagram feed) */}
            <button
              type="button"
              onClick={handleMuteToggle}
              className="absolute bottom-3 right-3 z-[10] flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
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
        <Link href={`/post/${post.id}`} className="relative block w-full bg-surface-overlay">
          <div className="relative aspect-square w-full overflow-hidden">
            <FeedMediaImage
              candidates={imageCandidates.length ? imageCandidates : image ? [image] : []}
              alt={caption}
              priority={priority}
            />
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
