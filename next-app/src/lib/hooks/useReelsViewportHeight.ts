"use client";

import { useEffect, useState, type RefObject } from "react";

/** Sets --reels-slide-h on the scroll container for snap slide sizing. */
export function useReelsViewportHeight(
  containerRef: RefObject<HTMLElement | null>,
): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const next = el.clientHeight;
      if (next > 0) {
        el.style.setProperty("--reels-slide-h", `${next}px`);
        setHeight(next);
      }
    }

    measure();
    const raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  return height;
}
