/**
 * Centralized video/image prefetch with cancellation.
 * Only one "next" clip should download at a time — stale requests abort on fast scroll.
 */

const activeLeadBytePrefetches = new Map<string, AbortController>();

let allowedPrefetchPostIds = new Set<string>();

export function setReelPrefetchScope(
  currentPostId: string | null,
  nextPostId: string | null,
): void {
  allowedPrefetchPostIds = new Set(
    [currentPostId, nextPostId].filter(Boolean) as string[],
  );
}

export function cancelVideoPrefetchesExcept(keepUrls: string[] = []): void {
  const keep = new Set(keepUrls.filter(Boolean));
  for (const [url, controller] of activeLeadBytePrefetches) {
    if (keep.has(url)) continue;
    controller.abort();
    activeLeadBytePrefetches.delete(url);
  }
}

/** Range-fetch first ~512KB for +faststart MP4 — aborts previous lead-byte fetches. */
export function prefetchVideoLeadingBytesManaged(
  url: string,
  postId?: string,
): void {
  if (!url || typeof window === "undefined") return;

  if (
    postId &&
    allowedPrefetchPostIds.size > 0 &&
    !allowedPrefetchPostIds.has(postId)
  ) {
    return;
  }

  for (const [existingUrl, controller] of activeLeadBytePrefetches) {
    if (existingUrl === url) return;
    controller.abort();
    activeLeadBytePrefetches.delete(existingUrl);
  }

  const controller = new AbortController();
  activeLeadBytePrefetches.set(url, controller);

  void fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "force-cache",
    signal: controller.signal,
    headers: { Range: "bytes=0-524287" },
  })
    .catch(() => {})
    .finally(() => {
      if (activeLeadBytePrefetches.get(url) === controller) {
        activeLeadBytePrefetches.delete(url);
      }
    });
}
