"use client";

import { useMemo, useState } from "react";

type FeedMediaImageProps = {
  candidates: string[];
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

/** Native img with URL fallback chain — avoids Next/Image black boxes on Firebase URLs. */
export function FeedMediaImage({
  candidates,
  alt,
  priority = false,
  className = "object-cover",
}: FeedMediaImageProps) {
  const urls = useMemo(
    () => candidates.filter(Boolean),
    [candidates],
  );
  const [index, setIndex] = useState(0);
  const src = urls[index];

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay text-xs text-muted">
        —
      </div>
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
      className={`absolute inset-0 h-full w-full ${className}`}
      onError={() => {
        if (index + 1 < urls.length) setIndex((i) => i + 1);
      }}
    />
  );
}
