"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getPostVideoUrl } from "@/lib/services/firestore";
import {
  getPostGridThumbnailCandidates,
  pickGridVideoPreviewUrl,
  pickImageSource,
} from "@/lib/utils/video-sources";
import { IconLayers, IconMenu, IconPin, IconReels } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

function GridVideoPreview({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [frameReady, setFrameReady] = useState(false);

  useEffect(() => {
    setFrameReady(false);
    const video = ref.current;
    if (!video) return;
    video.load();
  }, [src]);

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {poster && !frameReady && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        src={src}
        poster={poster}
        preload="metadata"
        muted
        playsInline
        className={`h-full w-full object-cover ${frameReady ? "" : "opacity-0"}`}
        onLoadedData={() => {
          const video = ref.current;
          if (!video) return;
          try {
            video.currentTime = 0.1;
          } catch {
            setFrameReady(true);
          }
        }}
        onSeeked={() => setFrameReady(true)}
        onError={() => setFrameReady(false)}
      />
    </div>
  );
}

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
  const [useVideo, setUseVideo] = useState(thumbCandidates.length === 0);

  const thumb = thumbCandidates[thumbIndex];
  const previewVideo = pickGridVideoPreviewUrl(post);

  if (!videoUrl && !thumb) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-overlay text-xs text-muted">
        {fallbackLabel}
      </div>
    );
  }

  if (!useVideo && thumb) {
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
            return;
          }
          if (previewVideo) setUseVideo(true);
        }}
      />
    );
  }

  if (previewVideo) {
    return (
      <GridVideoPreview
        src={previewVideo}
        poster={thumbCandidates[0]}
        className="pointer-events-none"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-surface-overlay text-xs text-muted">
      {fallbackLabel}
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
