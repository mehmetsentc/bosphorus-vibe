"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_MS, VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import {
  hasPostVideo,
  pickVideoSource,
  type VideoPlaybackContext,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Picks an initial video URL from network tier + user quality prefs, then
 * downgrades on playback errors or prolonged buffering (waiting).
 */
export function useAdaptiveVideoSrc(
  post: UserPostDoc,
  context: VideoPlaybackContext,
  isActive = true,
) {
  const tier = useEffectiveNetworkTier();
  const settings = useSettingsOptional();
  const preferHighQuality = settings?.prefs.mediaQuality === "high";

  const picked = useMemo(() => {
    if (!hasPostVideo(post)) {
      return { src: "", poster: undefined as string | undefined, fallbacks: [] as string[] };
    }
    return pickVideoSource(post, tier, context, { preferHighQuality });
  }, [post, tier, context, preferHighQuality]);

  const sources = useMemo(
    () => [picked.src, ...picked.fallbacks].filter(Boolean),
    [picked],
  );

  const [srcIndex, setSrcIndex] = useState(0);
  const srcIndexRef = useRef(0);
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const src = sources[srcIndex] ?? sources[0] ?? "";

  useEffect(() => {
    srcIndexRef.current = 0;
    setSrcIndex(0);
  }, [post.id, picked.src, tier, preferHighQuality, context]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const downgrade = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < sourcesRef.current.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      return true;
    }
    return false;
  }, []);

  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const onWaiting = useCallback(() => {
    if (!isActive || srcIndex >= sources.length - 1) return;
    if (stallTimerRef.current) return;
    const stallMs =
      context === "reels"
        ? VIDEO_STALL_DOWNGRADE_REELS_MS
        : VIDEO_STALL_DOWNGRADE_MS;
    stallTimerRef.current = setTimeout(() => {
      stallTimerRef.current = null;
      downgrade();
    }, stallMs);
  }, [isActive, srcIndex, sources.length, downgrade, context]);

  const onPlaying = useCallback(() => {
    clearStallTimer();
  }, [clearStallTimer]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
    return downgrade();
  }, [clearStallTimer, downgrade]);

  useEffect(() => clearStallTimer, [clearStallTimer]);

  return {
    src,
    poster: picked.poster,
    tier,
    onWaiting,
    onPlaying,
    onError,
  };
}
