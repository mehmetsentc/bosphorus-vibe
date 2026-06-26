"use client";

import Link from "next/link";
import { getPostImageUrl, getPostVideoUrl } from "@/lib/services/firestore";
import { getVideoReelsPath } from "@/lib/utils/video-sources";
import { FeedVideoPoster } from "@/components/post/FeedVideoPoster";
import { useT } from "@/components/providers/I18nProvider";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

type EventMediaFeedProps = {
  posts: EnrichedPost[];
  eventId: string;
};

/** Grid shows poster thumbnails only — no video decoders until user taps. */
export function EventMediaFeed({ posts, eventId }: EventMediaFeedProps) {
  const t = useT();

  if (!posts.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">{t("eventMediaFeed")}</h2>
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {posts.map((post) => {
          const hasVideo = Boolean(getPostVideoUrl(post));
          const imageUrl = getPostImageUrl(post);
          const href = hasVideo
            ? getVideoReelsPath(post.id)
            : `/post/${post.id}?from=/events/${eventId}`;

          return (
            <Link
              key={post.id}
              href={href}
              className="relative aspect-square overflow-hidden bg-surface-overlay"
            >
              {hasVideo ? (
                <>
                  <FeedVideoPoster post={post} />
                  <span className="absolute right-1.5 top-1.5 text-[10px] text-white drop-shadow">
                    ▶
                  </span>
                </>
              ) : imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              ) : null}
              {post.userName && (
                <span className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4 text-[9px] text-white/90">
                  @{post.userName}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
