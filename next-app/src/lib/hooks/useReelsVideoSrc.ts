"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import {
  getCachedVideoBlobUrl,
  prefetchVideoBlob,
} from "@/lib/utils/video-blob-cache";
import {
  getPostVideoVariants,
  hasPostVideo,
  pickVideoSource,
} from "@/lib/utils/video-sources";
import { filterExistingVideoUrls } from "@/lib/utils/video-url-probe";
import type { UserPostDoc } from "@/types";

/**
 * Reels: verify small variants exist, prefetch into blob cache for instant swipe.
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  isActive: boolean,
) {
  const tier = useEffectiveNetworkTier();
  const picked = useMemo(() => {
    if (!hasPostVideo(post)) {
      return { src: "", poster: undefined as string | undefined, fallbacks: [] as string[] };
    }
    return pickVideoSource(post, tier, "reels");
  }, [post, tier]);

  const { original } = useMemo(() => getPostVideoVariants(post), [post]);

  const candidateList = useMemo(() => {
    const all = [picked.src, ...picked.fallbacks].filter(Boolean);
    const small = all.filter((u) => u !== original);
    const withOriginal = original ? [...small, original] : small;
    return [...new Set(withOriginal)];
  }, [picked, original]);

  const [resolvedUrls, setResolvedUrls] = useState<string[]>([]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const resolveGen = useRef(0);

  useEffect(() => {
    if (!shouldLoad || !candidateList.length) {
      setResolvedUrls([]);
      return;
    }

    const gen = ++resolveGen.current;

    const blobCached = candidateList.filter((u) => getCachedVideoBlobUrl(u));
    if (blobCached.length) setResolvedUrls(blobCached);

    void (async () => {
      const existing = await filterExistingVideoUrls(candidateList.slice(0, 4));
      if (resolveGen.current !== gen) return;
      if (existing.length > 0) {
        setResolvedUrls(existing);
      } else if (original) {
        setResolvedUrls([original]);
      } else {
        setResolvedUrls(candidateList);
      }
    })();
  }, [shouldLoad, candidateList, original, post.id]);

  const remoteSrc = resolvedUrls[srcIndex] ?? resolvedUrls[0] ?? "";

  useEffect(() => {
    if (!shouldLoad || !remoteSrc) return;

    const cached = getCachedVideoBlobUrl(remoteSrc);
    if (cached) {
      setBlobSrc(cached);
      return;
    }

    setBlobSrc(null);
    const prefetch = prefetchVideoBlob(remoteSrc, isActive ? "high" : "low");
    if (!prefetch) return;
    void prefetch
      .then((url) => setBlobSrc(url))
      .catch(() => setBlobSrc(null));
  }, [shouldLoad, remoteSrc, isActive, post.id]);

  useEffect(() => {
    setSrcIndex(0);
    setBlobSrc(null);
  }, [post.id]);

  const playbackSrc = blobSrc || remoteSrc;
  const resolving = shouldLoad && !playbackSrc && candidateList.length > 0;

  const downgrade = useCallback((): boolean => {
    const next = srcIndex + 1;
    if (next < resolvedUrls.length) {
      setSrcIndex(next);
      setBlobSrc(null);
      return true;
    }
    return false;
  }, [srcIndex, resolvedUrls.length]);

  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const onWaiting = useCallback(() => {
    if (!isActive || srcIndex >= resolvedUrls.length - 1) return;
    if (stallTimerRef.current) return;
    stallTimerRef.current = setTimeout(() => {
      stallTimerRef.current = null;
      downgrade();
    }, VIDEO_STALL_DOWNGRADE_REELS_MS);
  }, [isActive, srcIndex, resolvedUrls.length, downgrade]);

  const onPlaying = useCallback(() => clearStallTimer(), [clearStallTimer]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
    return downgrade();
  }, [clearStallTimer, downgrade]);

  useEffect(() => clearStallTimer, [clearStallTimer]);

  return {
    src: playbackSrc,
    remoteSrc,
    poster: picked.poster,
    tier,
    resolving,
    onWaiting,
    onPlaying,
    onError,
  };
}
