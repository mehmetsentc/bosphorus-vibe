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

    const run = () => {
      void fetchReelsFirstPage().catch(() => {});
    };

    const win = window as Window & {
      requestIdleCallback?: (
        cb: IdleRequestCallback,
        opts?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(run, { timeout: 4000 });
      return () => win.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(run, 1500);
    return () => window.clearTimeout(id);
  }, [hydrated]);

  return null;
}
