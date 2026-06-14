"use client";

import { useCallback, useEffect, useState } from "react";
import { listStoryHighlights } from "@/lib/services/story-highlights";
import type { StoryHighlightDoc } from "@/types";

export function useStoryHighlights(userId?: string) {
  const [items, setItems] = useState<StoryHighlightDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await listStoryHighlights(userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
