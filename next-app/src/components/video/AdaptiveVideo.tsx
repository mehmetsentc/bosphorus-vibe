"use client";

import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import { pickVideoSource } from "@/lib/utils/video-sources";
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
  const { src, poster } = pickVideoSource(post, tier);
  const preload = getPreloadStrategy(tier, isActive);

  if (!src) return null;

  return (
    <video
      key={`${post.id}-${tier}`}
      src={src}
      poster={poster}
      loop={loop}
      muted={muted}
      autoPlay={autoPlay}
      playsInline={playsInline}
      preload={preload}
      className={className}
    />
  );
}
