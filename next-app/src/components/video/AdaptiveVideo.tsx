"use client";

import { useEffect, useRef, useState } from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import { pickVideoSource } from "@/lib/utils/video-sources";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

type AdaptiveVideoProps = {
  post: UserPostDoc;
  className?: string;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  isActive?: boolean;
};

export function AdaptiveVideo({
  post,
  className = "h-full w-full object-cover",
  loop,
  muted = true,
  autoPlay,
  playsInline = true,
  isActive = false,
}: AdaptiveVideoProps) {
  const tier = useEffectiveNetworkTier();
  const { src, poster } = pickVideoSource(post, tier, "detail");
  const preload = getPreloadStrategy(tier, isActive);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);
  const [showPoster, setShowPoster] = useState(true);

  // Global singleton: pause when another video starts
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playingId !== null && playingId !== post.id) {
      el.pause();
    }
  }, [playingId, post.id]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive && autoPlay) {
      el.play().catch(() => {});
      requestPlay(post.id);
    } else {
      el.pause();
      releasePlay(post.id);
    }
  }, [isActive, autoPlay, post.id, requestPlay, releasePlay]);

  if (!src) return null;

  return (
    <div className="relative h-full w-full">
      {showPoster && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        key={`${post.id}-${tier}`}
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        autoPlay={isActive && autoPlay}
        playsInline={playsInline}
        preload={preload}
        className={className}
        onPlaying={() => {
          setShowPoster(false);
          requestPlay(post.id);
        }}
        onPause={() => setShowPoster(true)}
      />
    </div>
  );
}
