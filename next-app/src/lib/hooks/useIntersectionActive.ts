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
  const [isNear, setIsNear] = useState(false);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const near = entry.isIntersecting;
        const active = near && entry.intersectionRatio >= threshold;
        setIsNear(near);
        setIsActive(active);
        if (active) onVisibleRef.current?.();
      },
      { threshold: [0, threshold, 1], rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isActive, isNear };
}
