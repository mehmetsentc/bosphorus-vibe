"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { VIDEO_STALL_DOWNGRADE_REELS_MS } from "@/lib/performance/app-state";
import {
  getCachedVideoBlobUrl,
  isVideoBlobUrlValid,
  prefetchVideoBlob,
} from "@/lib/utils/video-blob-cache";
import {
  getPostVideoVariants,
  getReelsPlaybackLadder,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import { filterExistingVideoUrls } from "@/lib/utils/video-url-probe";
import type { UserPostDoc } from "@/types";

const UPGRADE_DELAY_FAST_MS = 1_200;
const UPGRADE_DELAY_SLOW_MS = 2_500;

/**
 * Reels: preview for instant start, upgrade to low/original while playing (IG-style).
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  isActive: boolean,
) {
  const tier = useEffectiveNetworkTier();
  const ladder = useMemo(() => {
    if (!hasPostVideo(post)) return [] as string[];
    return getReelsPlaybackLadder(post);
  }, [post]);

  const { original, poster } = useMemo(() => getPostVideoVariants(post), [post]);

  const [resolvedUrls, setResolvedUrls] = useState<string[]>([]);
  const [srcIndex, setSrcIndex] = useState(0);
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const resolveGen = useRef(0);

  useEffect(() => {
    if (!shouldLoad || !ladder.length) {
      setResolvedUrls([]);
      return;
    }

    const gen = ++resolveGen.current;

    const blobCached = ladder.filter((u) => getCachedVideoBlobUrl(u));
    if (blobCached.length) setResolvedUrls(blobCached);

    void (async () => {
      const existing = await filterExistingVideoUrls(ladder.slice(0, 4));
      if (resolveGen.current !== gen) return;
      if (existing.length > 0) {
        setResolvedUrls(existing);
      } else if (original) {
        setResolvedUrls([original]);
      } else {
        setResolvedUrls(ladder);
      }
    })();
  }, [shouldLoad, ladder, original, post.id]);

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

  const safeBlob =
    blobSrc && isVideoBlobUrlValid(remoteSrc, blobSrc) ? blobSrc : null;
  const playbackSrc = safeBlob || remoteSrc;
  const resolving = shouldLoad && !playbackSrc && ladder.length > 0;

  const maxQualityIndex = useMemo(() => {
    if (!resolvedUrls.length) return 0;
    if (tier === "slow") return 0;
    return resolvedUrls.length - 1;
  }, [resolvedUrls, tier]);

  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upgradeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const clearUpgradeTimer = useCallback(() => {
    if (upgradeTimerRef.current) {
      clearTimeout(upgradeTimerRef.current);
      upgradeTimerRef.current = null;
    }
  }, []);

  const downgrade = useCallback((): boolean => {
    if (srcIndex <= 0) return false;
    setSrcIndex((i) => Math.max(0, i - 1));
    setBlobSrc(null);
    return true;
  }, [srcIndex]);

  const tryUpgrade = useCallback(() => {
    if (!isActive || srcIndex >= maxQualityIndex) return;
    setSrcIndex((i) => Math.min(i + 1, maxQualityIndex));
    setBlobSrc(null);
  }, [isActive, srcIndex, maxQualityIndex]);

  const scheduleUpgrade = useCallback(() => {
    clearUpgradeTimer();
    if (!isActive || srcIndex >= maxQualityIndex) return;
    const delay =
      tier === "fast" ? UPGRADE_DELAY_FAST_MS : UPGRADE_DELAY_SLOW_MS;
    upgradeTimerRef.current = setTimeout(() => {
      upgradeTimerRef.current = null;
      tryUpgrade();
    }, delay);
  }, [clearUpgradeTimer, isActive, srcIndex, maxQualityIndex, tier, tryUpgrade]);

  const onWaiting = useCallback(() => {
    if (!isActive || srcIndex <= 0) return;
    if (stallTimerRef.current) return;
    stallTimerRef.current = setTimeout(() => {
      stallTimerRef.current = null;
      downgrade();
    }, VIDEO_STALL_DOWNGRADE_REELS_MS);
  }, [isActive, srcIndex, downgrade]);

  const onPlaying = useCallback(() => {
    clearStallTimer();
    scheduleUpgrade();
  }, [clearStallTimer, scheduleUpgrade]);

  const onError = useCallback((): boolean => {
    clearStallTimer();
    clearUpgradeTimer();
    if (srcIndex < resolvedUrls.length - 1) {
      setSrcIndex((i) => i + 1);
      setBlobSrc(null);
      return true;
    }
    return downgrade();
  }, [
    clearStallTimer,
    clearUpgradeTimer,
    srcIndex,
    resolvedUrls.length,
    downgrade,
  ]);

  useEffect(() => {
    return () => {
      clearStallTimer();
      clearUpgradeTimer();
    };
  }, [clearStallTimer, clearUpgradeTimer]);

  useEffect(() => {
    if (!isActive) clearUpgradeTimer();
  }, [isActive, clearUpgradeTimer]);

  return {
    src: playbackSrc,
    remoteSrc,
    poster,
    tier,
    resolving,
    onWaiting,
    onPlaying,
    onError,
  };
}
