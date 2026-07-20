"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { FeedMediaImage } from "@/components/post/FeedMediaImage";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { IconPlay } from "@/components/icons/Icons";
import { useFeedVideoVisibility } from "@/lib/hooks/useFeedVideoVisibility";
import {
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
} from "@/lib/services/firestore";
import {
  getFastFlowPlaybackUrl,
  getPostFeedImageCandidates,
  getPostFeedThumbnailCandidates,
} from "@/lib/utils/video-sources";
import { formatFeedRelativeTime } from "@/lib/utils/timeline-groups";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import type { EnrichedPost } from "@/store/appStore";

const PostCommentModal = dynamic(
  () =>
    import("@/components/post/PostCommentModal").then((m) => ({
      default: m.PostCommentModal,
    })),
  { ssr: false },
);

type TimelinePostCardProps = {
  post: EnrichedPost;
};

export function TimelinePostCard({ post }: TimelinePostCardProps) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const [commentOpen, setCommentOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, isActive, isNear } = useFeedVideoVisibility<HTMLDivElement>(post.id);

  const video = getPostVideoUrl(post);
  const imageUrl = getPostImageUrl(post);
  const caption = getPostCaption(post, locale);
  const relativeTime = formatFeedRelativeTime(post.timePosted, locale, t);
  const profileHref = post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`;

  const poster = useMemo(() => {
    if (!video) return null;
    const candidates = getPostFeedThumbnailCandidates(post);
    return candidates[0] ?? post.postVideothumbnail ?? imageUrl ?? null;
  }, [post, video, imageUrl]);

  const imageCandidates = useMemo(() => getPostFeedImageCandidates(post), [post]);

  const playbackUrl = useMemo(() => {
    if (!video || (!isActive && !isNear)) return "";
    return getFastFlowPlaybackUrl(post);
  }, [video, isActive, isNear, post]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !playbackUrl) return;

    if (isActive) {
      el.muted = true;
      el.setAttribute("muted", "");
      el.play().catch(() => {
        el.muted = true;
        el.setAttribute("muted", "");
        el.play().catch(() => {});
      });
      return;
    }

    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      /* ignore seek before metadata */
    }
    setShowPoster(true);
  }, [isActive, playbackUrl]);

  const openMedia = useCallback(() => {
    if (video) router.push(`/feed/${post.id}`);
    else router.push(`/post/${post.id}`);
  }, [router, post.id, video]);

  const captionPreview =
    !expanded && caption.length > 140 ? `${caption.slice(0, 140).trim()}…` : caption;

  return (
    <article className="border-b border-border/70 pb-3">
      <header className="flex items-center gap-3 px-3 py-3">
        <Link href={profileHref} className="shrink-0">
          {post.userPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.userPhoto}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
              {(post.userName ?? "?")[0]?.toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={profileHref}
              className="truncate text-[14px] font-semibold leading-tight hover:opacity-80"
            >
              {post.userName ?? "user"}
            </Link>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <time
              dateTime={post.timePosted.toISOString()}
              className="shrink-0 text-xs text-muted"
            >
              {relativeTime}
            </time>
          </div>
          {post.activityName && (
            <p className="mt-0.5 truncate text-xs text-vibe">{post.activityName}</p>
          )}
        </div>
      </header>

      {(video || imageUrl || imageCandidates.length > 0) && (
        <div
          ref={ref}
          role="button"
          tabIndex={0}
          onClick={openMedia}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openMedia();
            }
          }}
          className="group relative block w-full cursor-pointer overflow-hidden bg-surface-overlay text-left"
        >
          {video ? (
            <>
              <div className="relative max-h-[min(70vh,560px)] w-full overflow-hidden bg-surface-overlay">
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster}
                    alt=""
                    className={`max-h-[min(70vh,560px)] w-full object-cover transition-opacity duration-150 ${
                      isActive && !showPoster ? "opacity-0" : "opacity-100"
                    }`}
                  />
                ) : imageCandidates.length > 0 ? (
                  <FeedMediaImage
                    candidates={imageCandidates}
                    alt={caption || post.userName || "post"}
                    mode="auto"
                    className="max-h-[min(70vh,560px)] object-cover"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-surface-overlay" />
                )}

                {playbackUrl ? (
                  <video
                    ref={videoRef}
                    data-feed-video-id={post.id}
                    src={playbackUrl}
                    poster={poster ?? undefined}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    {...({ webkitPlaysinline: "true" } as Record<string, string>)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ${
                      isActive && !showPoster ? "opacity-100" : "opacity-0"
                    }`}
                    onPlaying={() => setShowPoster(false)}
                    onTimeUpdate={(e) => {
                      if (showPoster && e.currentTarget.currentTime > 0.05) {
                        setShowPoster(false);
                      }
                    }}
                    onPause={() => {
                      if (!isActive) setShowPoster(true);
                    }}
                  />
                ) : null}
              </div>

              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              {(!isActive || showPoster) && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/25 backdrop-blur-sm transition group-active:scale-95">
                  <IconPlay size={22} className="ml-0.5" />
                </span>
              )}
            </>
          ) : (
            <div className="max-h-[min(70vh,560px)] w-full">
              <FeedMediaImage
                candidates={imageCandidates}
                alt={caption || post.userName || "post"}
                mode="auto"
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

      <PostActionsBar
        post={post}
        onCommentClick={() => setCommentOpen(true)}
        compact
      />

      <div className="space-y-1.5 px-3 pb-1">
        {caption && (
          <div className="text-sm leading-snug">
            <p className="whitespace-pre-wrap">
              <Link href={profileHref} className="mr-1.5 font-semibold hover:opacity-80">
                {post.userName ?? "user"}
              </Link>
              <span className="text-foreground/90">{captionPreview}</span>
            </p>
            {caption.length > 140 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-0.5 text-sm text-muted hover:text-foreground"
              >
                {expanded ? t("timelineShowLess") : t("timelineShowMore")}
              </button>
            )}
          </div>
        )}

        <PostTaggedPeople tags={post.taggedPeople} className="text-xs text-muted" />
      </div>

      {commentOpen && (
        <PostCommentModal
          postId={post.id}
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
        />
      )}
    </article>
  );
}
