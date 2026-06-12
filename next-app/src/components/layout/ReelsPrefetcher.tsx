"use client";

/**
 * Background reels prefetch when main layout mounts.
 * Uses shared in-flight fetch so /reels hook does not duplicate reads.
 */

import { useEffect } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { useAppStore } from "@/store/appStore";

export function ReelsPrefetcher() {
  const hydrated = useStoreHydration();
  const reelsCache = useAppStore((s) => s.reels);
  const lastFetched = useAppStore((s) => s.lastFetched.reels);

  useEffect(() => {
    if (!hydrated) return;
    if (reelsCache && !isCacheExpired(lastFetched)) return;
    void fetchReelsFirstPage().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return null;
}
