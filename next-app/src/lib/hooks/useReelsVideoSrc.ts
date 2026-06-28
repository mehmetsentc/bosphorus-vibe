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
import { probeVideoUrlsInBackground } from "@/lib/utils/video-url-probe";
import {
  getCachedVideoBlobUrl,
  isVideoBlobUrlValid,
  prefetchVideoBlob,
} from "@/lib/utils/video-blob-cache";
import {
  getReelsImmediatePlayback,
  getReelsPlaybackLadder,
  getTrustedVideoUrls,
  hasDownloadToken,
  hasPostVideo,
  orderUrlsTokenizedFirst,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

function buildInstantReelsUrls(
  playback: { src: string; fallbacks: string[] },
  post: UserPostDoc,
): string[] {
  const trusted = orderUrlsTokenizedFirst(
    [...new Set([playback.src, ...playback.fallbacks].filter(Boolean))],
  );
  if (trusted.length) return trusted;

  const { primary, original } = getTrustedVideoUrls(post);
  return orderUrlsTokenizedFirst(
    [primary, original, post.postVideo].filter((u): u is string => Boolean(u)),
  );
}

/**
 * Reels playback — stream from Firestore URL immediately.
 * Blob URL only when already cached (prewarm); never block on full download.
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

  const instantUrls = useMemo(
    () => (shouldLoad ? buildInstantReelsUrls(playback, post) : []),
    [shouldLoad, playback, post],
  );

  const fullLadder = useMemo(
    () => (hasPostVideo(post) ? getReelsPlaybackLadder(post) : []),
    [post],
  );

  const inferredUrls = useMemo(
    () =>
      fullLadder.filter(
        (u) => u && !instantUrls.includes(u) && !hasDownloadToken(u),
      ),
    [fullLadder, instantUrls],
  );

  const [playableUrls, setPlayableUrls] = useState<string[]>(instantUrls);

  useEffect(() => {
    setPlayableUrls(instantUrls);
  }, [instantUrls.join("|"), post.id]);

  useEffect(() => {
    if (!shouldLoad || inferredUrls.length === 0) return;
    return probeVideoUrlsInBackground(inferredUrls, (existing) => {
      if (!existing.length) return;
      setPlayableUrls((prev) =>
        orderUrlsTokenizedFirst([...new Set([...prev, ...existing])]),
      );
    });
  }, [shouldLoad, inferredUrls.join("|"), post.id]);

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

  const activeUrls = playableUrls.length ? playableUrls : instantUrls;
  const playbackSrc = shouldLoad ? (activeUrls[srcIndex] ?? activeUrls[0] ?? "") : "";

  const cachedBlob = playbackSrc ? getCachedVideoBlobUrl(playbackSrc) : null;
  const effectiveSrc =
    cachedBlob && isVideoBlobUrlValid(playbackSrc, cachedBlob)
      ? cachedBlob
      : playbackSrc;

  // Background blob for next slide only — never compete with active stream
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
    const ladder = orderUrlsTokenizedFirst([
      ...new Set([...urlsRef.current, ...fullLadder]),
    ]);
    urlsRef.current = ladder;
    const next = srcIndexRef.current + 1;
    if (next < ladder.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      setPlayableUrls(ladder);
      recordQualityDowngrade(post.id, ladder[next] ?? "unknown", "reels");
      return true;
    }
    return false;
  }, [post.id, fullLadder]);

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
    if (loadStartedRef.current !== null) {
      const ms = Math.round(performance.now() - loadStartedRef.current);
      recordTimeToFirstFrame(post.id, ms, "reels");
      recordVideoStart(post.id, ms, "reels");
      loadStartedRef.current = null;
    }
  }, [clearStallTimer, post.id]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
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
