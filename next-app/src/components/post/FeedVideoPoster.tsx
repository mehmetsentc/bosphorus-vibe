"use client";

import { useMemo, useState } from "react";
import { getPostFeedThumbnailCandidates, getPostVideoPoster } from "@/lib/utils/video-sources";
import type { UserPostDoc } from "@/types";

type FeedVideoPosterProps = {
  post: UserPostDoc;
  priority?: boolean;
  className?: string;
};

/** Static poster for feed — never shows black while video loads. */
export function FeedVideoPoster({
  post,
  priority = false,
  className = "object-cover",
}: FeedVideoPosterProps) {
  const urls = useMemo(() => {
    const list = getPostFeedThumbnailCandidates(post);
    const poster = getPostVideoPoster(post);
    if (poster && !list.includes(poster)) return [poster, ...list];
    return list;
  }, [post]);

  const [index, setIndex] = useState(0);
  const src = urls[index];

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay">
        <div className="h-14 w-14 rounded-full bg-black/40" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
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
