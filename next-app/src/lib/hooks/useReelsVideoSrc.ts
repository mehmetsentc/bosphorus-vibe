"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import { filterExistingVideoUrls, getVideoUrlProbeResult } from "@/lib/utils/video-url-probe";
import {
  getReelsImmediatePlayback,
  hasDownloadToken,
  hasPostVideo,
  orderUrlsTokenizedFirst,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Reels: probe Firebase URLs before playback so 404/403 guesses never block on spinner.
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

  const candidateUrls = useMemo(() => {
    const all = [playback.src, ...playback.fallbacks].filter(Boolean);
    return orderUrlsTokenizedFirst([...new Set(all)]);
  }, [playback]);

  const [playableUrls, setPlayableUrls] = useState<string[]>([]);
  const [probing, setProbing] = useState(false);
  const probeGenRef = useRef(0);

  useEffect(() => {
    if (!shouldLoad || !candidateUrls.length) {
      setPlayableUrls([]);
      setProbing(false);
      return;
    }

    const gen = ++probeGenRef.current;
    const tokenized = candidateUrls.filter(hasDownloadToken);
    const optimistic = tokenized.length ? tokenized : candidateUrls;

    const cachedOk = optimistic.filter((u) => getVideoUrlProbeResult(u) === true);
    if (cachedOk.length) {
      setPlayableUrls(cachedOk);
      setProbing(false);
      return;
    }

    setPlayableUrls(optimistic);
    setProbing(true);

    void filterExistingVideoUrls(candidateUrls).then((existing) => {
      if (probeGenRef.current !== gen) return;
      setPlayableUrls(existing.length ? existing : optimistic);
      setProbing(false);
    });

    return () => {
      probeGenRef.current += 1;
    };
  }, [shouldLoad, candidateUrls, post.id]);

  const [srcIndex, setSrcIndex] = useState(0);
  const srcIndexRef = useRef(0);
  const urlsRef = useRef(playableUrls);
  urlsRef.current = playableUrls;

  useEffect(() => {
    srcIndexRef.current = 0;
    setSrcIndex(0);
  }, [post.id, playableUrls.join("|")]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const playbackSrc = shouldLoad ? (playableUrls[srcIndex] ?? playableUrls[0] ?? "") : "";
  const resolving = shouldLoad && probing && !playbackSrc && hasPostVideo(post);

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
