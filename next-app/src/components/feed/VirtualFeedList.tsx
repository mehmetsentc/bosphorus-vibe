"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, type ReactNode } from "react";
import { startFeedFpsMonitor } from "@/lib/performance/video-metrics";

type VirtualFeedListProps<T> = {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  getItemKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Sentinel rendered after virtual list for infinite scroll */
  footer?: ReactNode;
};

/**
 * Window-scrolled virtual list — only visible feed rows mount in the DOM.
 * Keeps memory flat during long feed sessions (TikTok/IG-style).
 */
export function VirtualFeedList<T>({
  items,
  estimateSize = 540,
  overscan = 4,
  getItemKey,
  renderItem,
  footer,
}: VirtualFeedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    overscan,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  useEffect(() => {
    return startFeedFpsMonitor();
  }, []);

  useEffect(() => {
    virtualizer.measure();
  }, [items.length, virtualizer]);

  return (
    <div ref={listRef} className="relative w-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;
          return (
            <div
              key={getItemKey(item, virtualRow.index)}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
}
