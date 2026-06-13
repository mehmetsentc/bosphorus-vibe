"use client";

import { useEffect, useRef, type RefObject } from "react";

type LocalVideoPreviewProps = {
  /** Local blob URL from URL.createObjectURL(file) */
  src: string;
  poster?: string;
  className?: string;
  videoRef?: RefObject<HTMLVideoElement>;
  objectFit?: "cover" | "contain";
  loop?: boolean;
  autoPlay?: boolean;
  onDurationKnown?: (seconds: number) => void;
};

/**
 * Instant local-file video preview (Instagram-style).
 * Always muted for iOS autoplay; never hides the element behind opacity-0.
 */
export function LocalVideoPreview({
  src,
  poster,
  className = "h-full w-full object-cover",
  videoRef,
  objectFit = "cover",
  loop = true,
  autoPlay = true,
  onDurationKnown,
}: LocalVideoPreviewProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const resolvedRef = videoRef ?? internalRef;

  useEffect(() => {
    const el = resolvedRef.current;
    if (!el) return;

    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      if (autoPlay) void el.play().catch(() => {});
    };

    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        onDurationKnown?.(el.duration);
      }
      tryPlay();
    };

    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("loadeddata", tryPlay);

    if (el.readyState >= 1) onMeta();
    else el.load();

    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("loadeddata", tryPlay);
    };
  }, [src, resolvedRef, onDurationKnown, autoPlay]);

  return (
    <video
      ref={resolvedRef}
      src={src}
      poster={poster}
      className={className}
      style={{ objectFit }}
      muted
      playsInline
      autoPlay={autoPlay}
      loop={loop}
      preload="auto"
    />
  );
}
