"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import {
  hasPostVideo,
  pickVideoSource,
  type VideoPlaybackContext,
} from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

/** Firestore tier ladder; switches URL only on media element error. */
export function useAdaptiveVideoSrc(
  post: UserPostDoc,
  context: VideoPlaybackContext,
) {
  const settings = useSettingsOptional();
  const preferHighQuality = settings?.prefs.mediaQuality === "high";

  const picked = useMemo(() => {
    if (!hasPostVideo(post)) {
      return { src: "", poster: undefined as string | undefined, fallbacks: [] as string[] };
    }
    return pickVideoSource(post, context, { preferHighQuality });
  }, [post, context, preferHighQuality]);

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
  }, [post.id, picked.src, preferHighQuality, context]);

  useEffect(() => {
    srcIndexRef.current = srcIndex;
  }, [srcIndex]);

  const onError = useCallback((): boolean => {
    const next = srcIndexRef.current + 1;
    if (next < sourcesRef.current.length) {
      srcIndexRef.current = next;
      setSrcIndex(next);
      return true;
    }
    return false;
  }, []);

  return {
    src,
    poster: picked.poster,
    onError,
  };
}
