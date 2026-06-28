"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getFastFlowPlaybackUrl,
  getFastFlowPlaybackUrls,
  getPostVideoPoster,
  hasPostVideo,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/** Reels — preview/low first; error-only URL fallback. */
export function useReelsVideoSrc(post: UserPostDoc, shouldLoad: boolean) {
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

  const src = shouldLoad
    ? (urls[srcIndex] ?? urls[0] ?? getFastFlowPlaybackUrl(post))
    : "";

  const onError = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < urlsRef.current.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      return true;
    }
    return false;
  }, []);

  return {
    src,
    poster: getPostVideoPoster(post),
    srcIndex,
    onError,
  };
}
