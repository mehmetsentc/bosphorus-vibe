"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCachedVideoBlobUrl } from "@/lib/utils/video-blob-cache";
import {
  getFastFlowPlaybackUrl,
  getFastFlowPlaybackUrls,
  getPostVideoPoster,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/**
 * Reels — preview/low first; use prefetched blob when ready; error-only URL fallback.
 */
export function useReelsVideoSrc(
  post: UserPostDoc,
  shouldLoad: boolean,
  isActive: boolean,
) {
  const urls = useMemo(
    () => (shouldLoad && hasPostVideo(post) ? getFastFlowPlaybackUrls(post) : []),
    [shouldLoad, post],
  );

  const [srcIndex, setSrcIndex] = useState(0);
  const srcIndexRef = useRef(0);
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  useEffect(() => {
    srcIndexRef.current = 0;
    setSrcIndex(0);
  }, [post.id, urls.join("|")]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const remoteSrc =
    shouldLoad ? (urls[srcIndex] ?? urls[0] ?? getFastFlowPlaybackUrl(post)) : "";
  const cachedBlob = remoteSrc ? getCachedVideoBlobUrl(remoteSrc) : null;
  const playbackSrc = shouldLoad && cachedBlob ? cachedBlob : remoteSrc;

  const downgrade = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < urlsRef.current.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      return true;
    }
    return false;
  }, []);

  const onWaiting = useCallback(() => {}, []);

  const onPlaying = useCallback(() => {}, []);

  const onError = useCallback((): boolean => downgrade(), [downgrade]);

  return {
    src: playbackSrc,
    remoteSrc,
    poster: getPostVideoPoster(post),
    tier: "normal" as const,
    resolving: false,
    onWaiting,
    onPlaying,
    onError,
  };
}
