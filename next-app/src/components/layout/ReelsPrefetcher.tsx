"use client";

/**
 * Background reels prefetch when main layout mounts.
 * Uses shared in-flight fetch so /reels hook does not duplicate reads.
 */

import { useEffect } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { prewarmReelsPosts } from "@/lib/utils/video-sources";
import { useAppStore } from "@/store/appStore";

export function ReelsPrefetcher() {
  const hydrated = useStoreHydration();
  const tier = useEffectiveNetworkTier();

  useEffect(() => {
    if (!hydrated) return;
    const { reels, lastFetched } = useAppStore.getState();
    if (reels && !isCacheExpired(lastFetched.reels)) {
      prewarmReelsPosts(reels.posts.slice(0, 3), tier);
    }
    void fetchReelsFirstPage().catch(() => {});
  }, [hydrated, tier]);

  return null;
}
