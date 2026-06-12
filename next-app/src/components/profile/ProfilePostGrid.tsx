"use client";

import { useState } from "react";
import Link from "next/link";
import { getPostVideoUrl } from "@/lib/services/firestore";
import {
  getPostGridThumbnailCandidates,
  pickImageSource,
} from "@/lib/utils/video-sources";
import { IconLayers, IconMenu, IconPin, IconReels } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

function GridMedia({
  post,
  videoUrl,
  fallbackLabel,
}: {
  post: UserPostDoc;
  videoUrl: string;
  fallbackLabel: string;
}) {
  const thumbCandidates = getPostGridThumbnailCandidates(post);
  const [thumbIndex, setThumbIndex] = useState(0);

  const thumb = thumbCandidates[thumbIndex];

  if (!videoUrl && !thumb) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-overlay text-xs text-muted">
        {fallbackLabel}
      </div>
    );
  }

  if (thumb) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumb}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => {
          if (thumbIndex + 1 < thumbCandidates.length) {
            setThumbIndex((i) => i + 1);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#1a1a1a] text-xs text-white/40">
      ▶
    </div>
  );
}

type ProfilePostGridProps = {
  posts: UserPostDoc[];
  aspect?: "square" | "reel";
  pinnedCount?: number;
  ownerId?: string;
  onManagePost?: (post: UserPostDoc) => void;
  /** Base path for profile feed, e.g. /profile/posts or /user/abc/posts */
  feedPath?: string;
  tab?: "posts" | "reels" | "tagged";
};

export function ProfilePostGrid({
  posts,
  aspect = "square",
  pinnedCount = 3,
  ownerId,
  onManagePost,
  feedPath,
  tab = "posts",
}: ProfilePostGridProps) {
  const t = useT();

  if (!posts.length) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        {t("noContentInTab")}
      </p>
    );
  }

  const aspectClass = aspect === "reel" ? "aspect-[9/16]" : "aspect-square";

  return (
    <div className="grid grid-cols-3 gap-px bg-border">
      {posts.map((post, index) => {
        const videoUrl = getPostVideoUrl(post);
        const isPinned = aspect === "square" && index < pinnedCount;
        const hasCarousel =
          Boolean(pickImageSource(post, "grid")) && Boolean(videoUrl);
        const canManage =
          Boolean(ownerId) &&
          post.postUserId === ownerId &&
          Boolean(onManagePost);

        const href = feedPath
          ? `${feedPath}/${post.id}${tab !== "posts" ? `?tab=${tab}` : ""}`
          : `/post/${post.id}`;

        return (
          <div key={post.id} className={`relative ${aspectClass}`}>
            <Link
              href={href}
              className="relative block h-full overflow-hidden bg-background"
            >
              <GridMedia
                post={post}
                videoUrl={videoUrl}
                fallbackLabel={t("postFallback")}
              />

              {isPinned && (
                <span className="absolute right-1.5 top-1.5 text-white drop-shadow-md">
                  <IconPin size={14} />
                </span>
              )}

              {videoUrl && !isPinned && (
                <span className="absolute right-1.5 top-1.5 text-white drop-shadow-md">
                  <IconReels size={14} />
                </span>
              )}

              {hasCarousel && (
                <span className="absolute right-1.5 top-1.5 text-white drop-shadow-md">
                  <IconLayers size={14} />
                </span>
              )}
            </Link>

            {canManage && (
              <button
                type="button"
                aria-label={t("managePost")}
                onClick={() => onManagePost?.(post)}
                className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75 active:scale-95"
              >
                <IconMenu size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
