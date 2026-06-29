"use client";

import { useEffect, useRef, useState } from "react";
import { useFeedVideoStore } from "@/store/feedVideoStore";

/**
 * Reports card visibility to the feed video coordinator.
 * Returns isActive when this post wins the largest visible area (Instagram-style).
 */
export function useFeedVideoVisibility<T extends HTMLElement>(postId: string) {
  const ref = useRef<T | null>(null);
  const [visibleRatio, setVisibleRatio] = useState(0);
  const reportVisibility = useFeedVideoStore((s) => s.reportVisibility);
  const clearVisibility = useFeedVideoStore((s) => s.clearVisibility);
  const activePostId = useFeedVideoStore((s) => s.activePostId);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        setVisibleRatio(ratio);
        reportVisibility(postId, ratio);
      },
      {
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
        rootMargin: "400px 0px",
      },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearVisibility(postId);
    };
  }, [postId, reportVisibility, clearVisibility]);

  const isActive = activePostId === postId;
  const isNear = visibleRatio > 0.08;

  return { ref, isActive, isNear, visibleRatio };
}
