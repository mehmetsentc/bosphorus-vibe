"use client";

/**
 * Background reels prefetch when main layout mounts.
 * Uses shared in-flight fetch so /reels hook does not duplicate reads.
 */

import { useEffect } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  pickVideoSource,
  prewarmVideoUrls,
} from "@/lib/utils/video-sources";
import { useAppStore } from "@/store/appStore";

function prewarmCachedReels(): void {
  const { reels, lastFetched } = useAppStore.getState();
  if (!reels || isCacheExpired(lastFetched.reels)) return;
  const urls = reels.posts
    .slice(0, 3)
    .map((post) => pickVideoSource(post, "slow", "feed").src)
    .filter(Boolean);
  prewarmVideoUrls(urls);
}

export function ReelsPrefetcher() {
  const hydrated = useStoreHydration();

  useEffect(() => {
    if (!hydrated) return;
    prewarmCachedReels();
    void fetchReelsFirstPage().catch(() => {});
  }, [hydrated]);

  return null;
}
