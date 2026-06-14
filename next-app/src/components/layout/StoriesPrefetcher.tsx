"use client";

import { useEffect } from "react";
import { prefetchStoriesFeed } from "@/lib/cache/stories-prefetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";

export function StoriesPrefetcher() {
  const hydrated = useStoreHydration();

  useEffect(() => {
    if (!hydrated) return;
    void prefetchStoriesFeed();
  }, [hydrated]);

  return null;
}
