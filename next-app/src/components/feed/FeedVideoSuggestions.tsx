"use client";

import Link from "next/link";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { getVideoReelsPath } from "@/lib/utils/video-sources";
import { FeedVideoPoster } from "@/components/post/FeedVideoPoster";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

type FeedVideoSuggestionsProps = {
  posts: EnrichedPost[];
};

export function FeedVideoSuggestions({ posts }: FeedVideoSuggestionsProps) {
  const t = useT();

  if (!posts.length) return null;

  return (
    <article className="border-b border-border bg-background py-4">
      <div className="mb-3 flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold">{t("feedSuggestVideos")}</h3>
        <Link href="/reels" className="text-xs font-semibold text-gold">
          {t("seeAll")}
        </Link>
      </div>
      <div className="events-scroll px-3">
        <div className="flex gap-3 pb-1">
          {posts.map((post) => {
            if (!getPostVideoUrl(post)) return null;
            return (
              <Link
                key={post.id}
                href={getVideoReelsPath(post.id)}
                className="group shrink-0"
              >
                <div className="relative h-[200px] w-[120px] overflow-hidden rounded-xl bg-surface-overlay ring-1 ring-border transition group-active:scale-[0.98] sm:h-[220px] sm:w-[130px]">
                  <FeedVideoPoster post={post} />
                  <div className="absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="truncate text-[11px] font-semibold text-white">
                      @{post.userName ?? "user"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}
