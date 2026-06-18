"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import {
  getPostVideoVariants,
  getReelsPlaybackLadder,
  getReelsStartIndex,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import { filterExistingVideoUrls } from "@/lib/utils/video-url-probe";
import type { UserPostDoc } from "@/types";

/**
 * Reels: one stable stream URL per post — low/original on fast networks,
 * preview on slow. No mid-play src changes (prevents 3–4s restart loops).
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  _isActive: boolean,
) {
  const tier = useEffectiveNetworkTier();
  const ladder = useMemo(() => {
    if (!hasPostVideo(post)) return [] as string[];
    return getReelsPlaybackLadder(post);
  }, [post]);

  const { original, poster } = useMemo(() => getPostVideoVariants(post), [post]);

  const [resolvedUrls, setResolvedUrls] = useState<string[]>([]);
  const [srcIndex, setSrcIndex] = useState(0);
  const resolveGen = useRef(0);
  const startIndexSetFor = useRef<string | null>(null);

  useEffect(() => {
    startIndexSetFor.current = null;
    setSrcIndex(0);
    setResolvedUrls([]);
  }, [post.id]);

  useEffect(() => {
    if (!shouldLoad || !ladder.length) {
      setResolvedUrls([]);
      return;
    }

    const gen = ++resolveGen.current;

    void (async () => {
      const existing = await filterExistingVideoUrls(ladder);
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

  useEffect(() => {
    if (!resolvedUrls.length || startIndexSetFor.current === post.id) return;
    startIndexSetFor.current = post.id;
    setSrcIndex(getReelsStartIndex(resolvedUrls, tier, original));
  }, [resolvedUrls, tier, original, post.id]);

  const playbackSrc = resolvedUrls[srcIndex] ?? resolvedUrls[0] ?? "";
  const resolving = shouldLoad && !playbackSrc && ladder.length > 0;

  const onWaiting = useCallback(() => {
    // No mid-play quality changes — buffering is normal for progressive MP4
  }, []);

  const onPlaying = useCallback(() => {}, []);

  const onError = useCallback((): boolean => {
    if (srcIndex <= 0) return false;
    setSrcIndex((i) => Math.max(0, i - 1));
    return true;
  }, [srcIndex]);

  return {
    src: playbackSrc,
    remoteSrc: playbackSrc,
    poster,
    tier,
    resolving,
    onWaiting,
    onPlaying,
    onError,
  };
}
