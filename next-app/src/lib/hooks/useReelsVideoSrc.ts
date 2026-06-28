"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import {
  recordQualityDowngrade,
  recordTimeToFirstFrame,
  recordVideoStart,
} from "@/lib/performance/video-metrics";
import { markVideoUrlProbe } from "@/lib/utils/video-url-probe";
import {
  getCachedVideoBlobUrl,
  isVideoBlobUrlValid,
  prefetchVideoBlob,
} from "@/lib/utils/video-blob-cache";
import {
  getReelsImmediatePlayback,
  getReelsPlaybackLadder,
  getReelsPlaybackUrlOrder,
  hasPostVideo,
  orderUrlsTokenizedFirst,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Reels playback — try Firestore URL ladder; downgrade only on real video errors.
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  isActive: boolean,
  isNext = false,
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

  const urlLadder = useMemo(
    () =>
      shouldLoad
        ? orderUrlsTokenizedFirst([
            ...new Set([
              ...getReelsPlaybackUrlOrder(post, tier, { preferHighQuality }),
              ...getReelsPlaybackLadder(post),
            ]),
          ])
        : [],
    [shouldLoad, post, tier, preferHighQuality],
  );

  const [srcIndex, setSrcIndex] = useState(0);
  const srcIndexRef = useRef(0);
  const ladderRef = useRef(urlLadder);
  ladderRef.current = urlLadder;

  useEffect(() => {
    srcIndexRef.current = 0;
    setSrcIndex(0);
  }, [post.id, urlLadder.join("|")]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const playbackSrc = shouldLoad
    ? (urlLadder[srcIndex] ?? urlLadder[0] ?? "")
    : "";

  const cachedBlob = playbackSrc ? getCachedVideoBlobUrl(playbackSrc) : null;
  const effectiveSrc =
    cachedBlob && isVideoBlobUrlValid(playbackSrc, cachedBlob)
      ? cachedBlob
      : playbackSrc;

  useEffect(() => {
    if (!shouldLoad || !playbackSrc || !isNext || isActive) return;
    void prefetchVideoBlob(playbackSrc, "low", post.id)?.catch(() => {});
  }, [shouldLoad, playbackSrc, isNext, isActive, post.id]);

  const loadStartedRef = useRef<number | null>(null);
  useEffect(() => {
    if (isActive && playbackSrc) {
      loadStartedRef.current = performance.now();
    }
  }, [isActive, playbackSrc, post.id]);

  const downgrade = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < ladderRef.current.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      recordQualityDowngrade(post.id, ladderRef.current[next] ?? "unknown", "reels");
      return true;
    }
    return false;
  }, [post.id]);

  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const onWaiting = useCallback(() => {
    if (!isActive || srcIndexRef.current >= ladderRef.current.length - 1) return;
    if (stallTimerRef.current) return;
    stallTimerRef.current = setTimeout(() => {
      stallTimerRef.current = null;
      downgrade();
    }, VIDEO_STALL_DOWNGRADE_REELS_MS);
  }, [isActive, downgrade]);

  const onPlaying = useCallback(() => {
    clearStallTimer();
    if (playbackSrc) markVideoUrlProbe(playbackSrc, true);
    if (loadStartedRef.current !== null) {
      const ms = Math.round(performance.now() - loadStartedRef.current);
      recordTimeToFirstFrame(post.id, ms, "reels");
      recordVideoStart(post.id, ms, "reels");
      loadStartedRef.current = null;
    }
  }, [clearStallTimer, post.id, playbackSrc]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
    const failed = ladderRef.current[srcIndexRef.current];
    if (failed) markVideoUrlProbe(failed, false);
    return downgrade();
  }, [clearStallTimer, downgrade]);

  useEffect(() => clearStallTimer, [clearStallTimer]);

  return {
    src: effectiveSrc,
    remoteSrc: playbackSrc,
    poster: playback.poster,
    tier,
    resolving: false,
    onWaiting,
    onPlaying,
    onError,
  };
}
