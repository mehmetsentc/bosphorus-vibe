"use client";

/**
 * Background reels prefetch when main layout mounts.
 * Uses shared in-flight fetch so /reels hook does not duplicate reads.
 */

import { useEffect } from "react";
import { fetchReelsFirstPage } from "@/lib/cache/reels-fetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";

export function ReelsPrefetcher() {
  const hydrated = useStoreHydration();

  useEffect(() => {
    if (!hydrated) return;
    void fetchReelsFirstPage().catch(() => {});
  }, [hydrated]);

  return null;
}
