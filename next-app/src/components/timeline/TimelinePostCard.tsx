"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { FeedMediaImage } from "@/components/post/FeedMediaImage";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { IconPlay } from "@/components/icons/Icons";
import {
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
} from "@/lib/services/firestore";
import {
  getPostFeedImageCandidates,
  getPostFeedThumbnailCandidates,
} from "@/lib/utils/video-sources";
import { formatTimelineClock } from "@/lib/utils/timeline-groups";
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
  isLastInGroup?: boolean;
};

export function TimelinePostCard({ post, isLastInGroup = false }: TimelinePostCardProps) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const [commentOpen, setCommentOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const video = getPostVideoUrl(post);
  const imageUrl = getPostImageUrl(post);
  const caption = getPostCaption(post, locale);
  const clock = formatTimelineClock(post.timePosted, locale);
  const poster = useMemo(() => {
    if (!video) return null;
    const candidates = getPostFeedThumbnailCandidates(post);
    return candidates[0] ?? post.postVideothumbnail ?? null;
  }, [post, video]);

  const openReels = useCallback(() => {
    if (video) router.push(`/feed/${post.id}`);
    else router.push(`/post/${post.id}`);
  }, [router, post.id, video]);

  const captionPreview =
    !expanded && caption.length > 220 ? `${caption.slice(0, 220).trim()}…` : caption;

  return (
    <article className="relative grid grid-cols-[2.75rem_1fr] gap-x-3 sm:grid-cols-[3.25rem_1fr] sm:gap-x-4">
      {/* Timeline rail */}
      <div className="relative flex flex-col items-center pt-1">
        <span className="relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-2 border-gold/80 bg-background shadow-[0_0_0_4px_rgba(212,175,55,0.12)]" />
        {!isLastInGroup && (
          <span className="mt-1 w-px flex-1 min-h-[1.5rem] bg-gradient-to-b from-gold/40 to-border/40" />
        )}
        <time
          dateTime={post.timePosted.toISOString()}
          className="mt-2 text-[10px] font-semibold tabular-nums text-muted sm:absolute sm:-left-1 sm:top-8 sm:mt-0 sm:-rotate-90 sm:origin-top-left sm:text-[11px]"
        >
          {clock}
        </time>
      </div>

      {/* Card */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border/80 bg-surface-card/80 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm transition hover:border-gold/25">
        <header className="flex items-start gap-3 border-b border-border/60 px-4 py-3">
          <Link
            href={post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`}
            className="shrink-0"
          >
            {post.userPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.userPhoto}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
                {(post.userName ?? "?")[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`}
              className="font-display text-[15px] font-semibold leading-tight hover:underline"
            >
              {post.userName ?? "user"}
            </Link>
            {post.activityName && (
              <p className="mt-0.5 text-xs font-medium text-vibe">{post.activityName}</p>
            )}
          </div>
          <Link
            href={`/post/${post.id}`}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-surface-overlay hover:text-foreground"
          >
            {t("timelineOpenPost")}
          </Link>
        </header>

        {(video || imageUrl) && (
          <button
            type="button"
            onClick={openReels}
            className="group relative block w-full overflow-hidden bg-black text-left"
          >
            {video && poster ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster}
                  alt=""
                  className="max-h-[520px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-sm transition group-hover:scale-105">
                  <IconPlay size={26} className="ml-0.5" />
                </span>
              </>
            ) : imageUrl ? (
              <div className="max-h-[520px] w-full">
                <FeedMediaImage
                  candidates={getPostFeedImageCandidates(post)}
                  alt={caption || post.userName || "post"}
                  mode="auto"
                  className="object-cover"
                />
              </div>
            ) : null}
          </button>
        )}

        <PostActionsBar
          post={post}
          onCommentClick={() => setCommentOpen(true)}
          hideCommentPreview
        />

        {(caption || post.taggedPeople?.length) && (
          <div className="space-y-1.5 px-4 pb-4">
            {caption && (
              <div className="text-sm leading-relaxed">
                <p className="whitespace-pre-wrap">
                  <Link
                    href={post.postUserId ? `/user/${post.postUserId}` : `/post/${post.id}`}
                    className="mr-1.5 font-semibold hover:underline"
                  >
                    {post.userName ?? "user"}
                  </Link>
                  <span className="text-foreground/90">{captionPreview}</span>
                </p>
                {caption.length > 220 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-1 text-xs font-semibold text-muted hover:text-foreground"
                  >
                    {expanded ? t("timelineShowLess") : t("timelineShowMore")}
                  </button>
                )}
              </div>
            )}

            <PostTaggedPeople tags={post.taggedPeople} className="text-xs text-muted" />
          </div>
        )}
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
