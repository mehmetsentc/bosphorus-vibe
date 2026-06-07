"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { STORY_MEDIA_CLASS } from "@/lib/utils/story-media";

type StoryMediaDisplayProps = {
  src: string;
  isVideo?: boolean;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  className?: string;
  mediaKey?: string;
  videoRef?: RefObject<HTMLVideoElement>;
  onTimeUpdate?: () => void;
  onEnded?: () => void;
};

export function StoryMediaDisplay({
  src,
  isVideo = false,
  poster,
  autoPlay,
  loop,
  muted,
  playsInline = true,
  preload,
  className = STORY_MEDIA_CLASS,
  mediaKey,
  videoRef,
  onTimeUpdate,
  onEnded,
}: StoryMediaDisplayProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [src, isVideo, mediaKey]);

  const markReady = useCallback(() => setReady(true), []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}
      {isVideo ? (
        <video
          key={mediaKey}
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload={preload}
          className={`${className} ${ready ? "opacity-100" : "opacity-0"}`}
          onLoadedData={markReady}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={`${className} ${ready ? "opacity-100" : "opacity-0"}`}
          onLoad={markReady}
        />
      )}
    </div>
  );
}
