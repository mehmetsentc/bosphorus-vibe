"use client";

import { useEffect, useRef, useState } from "react";

type UseIntersectionActiveOptions = {
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
};

export function useIntersectionActive<T extends HTMLElement>(
  options: UseIntersectionActiveOptions = {},
) {
  const { threshold = 0.65, rootMargin = "0px", onVisible } = options;
  const ref = useRef<T | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        setIsActive(visible);
        if (visible) onVisible?.();
      },
      { threshold: [0, threshold, 1], rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, onVisible]);

  return { ref, isActive };
}
