"use client";

import { memo, useEffect, useRef } from "react";
import { useReelsVideoSrc } from "@/lib/hooks/useReelsVideoSrc";
import { REELS_DECODE_TIMEOUT_MS } from "@/lib/performance/app-state";
import { getPostVideoPoster } from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

type ReelSlideVideoProps = {
  post: UserPostDoc & { userName?: string; userPhoto?: string };
  shouldLoad: boolean;
  isActive: boolean;
  preload: "auto" | "metadata" | "none";
  videoRef: (el: HTMLVideoElement | null) => void;
};

/** Reels slide video with tier fallback via useReelsVideoSrc. */
export const ReelSlideVideo = memo(function ReelSlideVideo({
  post,
  shouldLoad,
  isActive,
  preload,
  videoRef,
}: ReelSlideVideoProps) {
  const { src, srcIndex, onError } = useReelsVideoSrc(post, shouldLoad);
  const poster = getPostVideoPoster(post) ?? post.postVideothumbnail ?? undefined;
  const hasPlayedRef = useRef(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    hasPlayedRef.current = false;
  }, [post.id, src, srcIndex]);

  useEffect(() => {
    if (!isActive || !shouldLoad || !src) return;
    const timeout = window.setTimeout(() => {
      const video = document.querySelector<HTMLVideoElement>(
        `[data-reel-id="${post.id}"]`,
      );
      if (!video || hasPlayedRef.current) return;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      onErrorRef.current();
    }, REELS_DECODE_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [isActive, shouldLoad, src, srcIndex, post.id]);

  if (!src) return null;

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      key={`${post.id}-${srcIndex}-${src}`}
      data-reel-id={post.id}
      src={src}
      poster={poster}
      preload={preload}
      playsInline
      loop
      muted
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => onErrorRef.current()}
      onPlaying={() => {
        hasPlayedRef.current = true;
      }}
    />
  );
});
