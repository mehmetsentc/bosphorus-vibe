"use client";

/**
 * Kicks off a background reels fetch as soon as the main layout mounts.
 * By the time the user navigates to /reels the data is already in Zustand
 * cache, so the page renders immediately without the 10-20s black screen.
 */

import { useEffect } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { enrichPostsWithUsers, getVideoPostsPage } from "@/lib/services/firestore";
import { useAppStore } from "@/store/appStore";

const PREFETCH_SIZE = 12;

export function ReelsPrefetcher() {
  const hydrated = useStoreHydration();
  const reelsCache = useAppStore((s) => s.reels);
  const lastFetched = useAppStore((s) => s.lastFetched.reels);
  const setReelsCache = useAppStore((s) => s.setReelsCache);

  useEffect(() => {
    if (!hydrated) return;
    // Skip if cache is still fresh
    if (reelsCache && !isCacheExpired(lastFetched)) return;

    let cancelled = false;

    getVideoPostsPage(PREFETCH_SIZE, null)
      .then(async (page) => {
        if (cancelled) return;
        const enriched = await enrichPostsWithUsers(page.posts);
        if (cancelled) return;
        setReelsCache({ posts: enriched, hasMore: page.hasMore });
      })
      .catch(() => {
        // Silent — reels page will re-fetch on its own
      });

    return () => {
      cancelled = true;
    };
    // Only run once after hydration — reelsCache intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return null;
}
