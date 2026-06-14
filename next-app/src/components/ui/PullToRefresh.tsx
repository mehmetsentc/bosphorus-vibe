"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import { useT } from "@/components/providers/I18nProvider";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  /** When set, pull only triggers at scroll top of this element (reels scroll). */
  scrollRef?: RefObject<HTMLElement | null>;
};

const THRESHOLD = 72;

function readScrollTop(scrollRef?: RefObject<HTMLElement | null>): number {
  if (scrollRef?.current) return scrollRef.current.scrollTop;
  if (typeof window === "undefined") return 0;
  return window.scrollY;
}

export function PullToRefresh({
  onRefresh,
  refreshing = false,
  disabled = false,
  children,
  className = "",
  scrollRef,
}: PullToRefreshProps) {
  const t = useT();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pull, setPull] = useState(0);

  function onTouchStart(e: React.TouchEvent) {
    if (disabled || refreshing) return;
    if (readScrollTop(scrollRef) > 8) return;
    startY.current = e.touches[0]?.clientY ?? 0;
    pulling.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || disabled || refreshing) return;
    if (readScrollTop(scrollRef) > 8) {
      pulling.current = false;
      setPull(0);
      return;
    }
    const y = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, Math.min(y - startY.current, THRESHOLD * 1.5));
    setPull(delta);
    if (delta > 0 && scrollRef?.current) {
      e.preventDefault();
    }
  }

  async function onTouchEnd() {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD && !disabled && !refreshing) {
      setPull(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {(pull > 0 || refreshing) && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center"
          style={{
            height: refreshing ? 48 : pull,
            transition: pulling.current ? "none" : "height 0.2s ease",
          }}
        >
          <div className="flex items-end pb-2">
            {refreshing ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            ) : (
              <span className="text-xs text-muted">
                {pull >= THRESHOLD ? t("releaseToRefresh") : t("pullToRefresh")}
              </span>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
