"use client";

import { useMemo, useState } from "react";

type FeedMediaImageProps = {
  candidates: string[];
  alt: string;
  priority?: boolean;
  className?: string;
  /** "fill" = absolute fill (needs positioned parent), "auto" = natural height */
  mode?: "fill" | "auto";
};

/** Native img with URL fallback chain — avoids Next/Image black boxes on Firebase URLs. */
export function FeedMediaImage({
  candidates,
  alt,
  priority = false,
  className,
  mode = "fill",
}: FeedMediaImageProps) {
  const urls = useMemo(() => candidates.filter(Boolean), [candidates]);
  const [index, setIndex] = useState(0);
  const src = urls[index];

  if (!src) {
    return mode === "auto" ? (
      <div className="flex h-40 items-center justify-center bg-surface-overlay text-xs text-muted">—</div>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay text-xs text-muted">—</div>
    );
  }

  if (mode === "auto") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`block w-full ${className ?? "object-contain"}`}
        style={{ height: "auto", maxHeight: "75vh" }}
        onError={() => { if (index + 1 < urls.length) setIndex((i) => i + 1); }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`absolute inset-0 h-full w-full ${className ?? "object-cover"}`}
      onError={() => { if (index + 1 < urls.length) setIndex((i) => i + 1); }}
    />
  );
}
