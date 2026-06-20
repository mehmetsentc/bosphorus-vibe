"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import {
  getReelsImmediatePlayback,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Reels: instant playback from Firestore URLs with stall downgrade on buffer.
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  isActive: boolean,
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
  const srcIndexRef = useRef(0);
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    srcIndexRef.current = 0;
    setSrcIndex(0);
  }, [post.id, playback.src, tier, preferHighQuality]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const playbackSrc = shouldLoad ? (urls[srcIndex] ?? urls[0] ?? "") : "";
  const resolving = shouldLoad && !playbackSrc && hasPostVideo(post);

  const downgrade = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < urlsRef.current.length) {
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
    if (!isActive || srcIndexRef.current >= urlsRef.current.length - 1) return;
    if (stallTimerRef.current) return;
    stallTimerRef.current = setTimeout(() => {
      stallTimerRef.current = null;
      downgrade();
    }, VIDEO_STALL_DOWNGRADE_REELS_MS);
  }, [isActive, downgrade]);

  const onPlaying = useCallback(() => {
    clearStallTimer();
  }, [clearStallTimer]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
    return downgrade();
  }, [clearStallTimer, downgrade]);

  useEffect(() => clearStallTimer, [clearStallTimer]);

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
