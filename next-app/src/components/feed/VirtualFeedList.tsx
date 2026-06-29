"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type VirtualFeedListProps<T> = {
  items: T[];
  estimateSize?: number | ((index: number) => number);
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
  const [scrollMargin, setScrollMargin] = useState(0);

  const resolveEstimateSize = useCallback(
    (index: number) =>
      typeof estimateSize === "function" ? estimateSize(index) : estimateSize,
    [estimateSize],
  );

  const itemKeyFn = useCallback(
    (index: number) => {
      const item = items[index];
      return item ? getItemKey(item, index) : String(index);
    },
    [items, getItemKey],
  );

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: resolveEstimateSize,
    overscan,
    scrollMargin,
    getItemKey: itemKeyFn,
  });

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const syncScrollMargin = () => {
      setScrollMargin(el.offsetTop);
    };

    syncScrollMargin();
    const observer = new ResizeObserver(syncScrollMargin);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    virtualizer.measure();
  }, [items, virtualizer]);

  return (
    <div
      ref={listRef}
      className="relative w-full"
      style={{ overflowAnchor: "none" }}
    >
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
              key={itemKeyFn(virtualRow.index)}
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
