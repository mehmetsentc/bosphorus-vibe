"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import {
  getReelsImmediatePlayback,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Reels: instant playback from Firestore URLs — no blocking HEAD probe.
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  _isActive: boolean,
) {
  const tier = useEffectiveNetworkTier();
  const settings = useSettingsOptional();
  const preferHighQuality = settings?.prefs.mediaQuality === "high";

  const playback = useMemo(() => {
    if (!hasPostVideo(post)) {
      return { src: "", fallbacks: [] as string[], poster: undefined as string | undefined };
    }
    return getReelsImmediatePlayback(post, tier, { preferHighQuality });
  }, [post, tier, preferHighQuality]);

  const urls = useMemo(() => {
    const all = [playback.src, ...playback.fallbacks].filter(Boolean);
    return [...new Set(all)];
  }, [playback]);

  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setSrcIndex(0);
  }, [post.id, playback.src]);

  const playbackSrc = shouldLoad ? (urls[srcIndex] ?? urls[0] ?? "") : "";
  const resolving = shouldLoad && !playbackSrc && hasPostVideo(post);

  const onWaiting = useCallback(() => {}, []);
  const onPlaying = useCallback(() => {}, []);

  const onError = useCallback((): boolean => {
    if (srcIndex >= urls.length - 1) return false;
    setSrcIndex((i) => i + 1);
    return true;
  }, [srcIndex, urls.length]);

  return {
    src: playbackSrc,
    remoteSrc: playbackSrc,
    poster: playback.poster,
    tier,
    resolving,
    onWaiting,
    onPlaying,
    onError,
  };
}
