"use client";

import { useEffect } from "react";
import { prefetchFeedFirstPage } from "@/lib/cache/feed-prefetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";

/** Warm home feed cache as soon as the app shell hydrates. */
export function FeedPrefetcher() {
  const hydrated = useStoreHydration();

  useEffect(() => {
    if (!hydrated) return;
    void prefetchFeedFirstPage();
  }, [hydrated]);

  return null;
}
