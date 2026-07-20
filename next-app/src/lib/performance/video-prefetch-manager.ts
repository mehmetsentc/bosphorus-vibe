/**
 * Centralized video/image prefetch with cancellation.
 * Keeps up to 2 concurrent lead-byte fetches (active + next).
 */

const activeLeadBytePrefetches = new Map<string, AbortController>();
const MAX_CONCURRENT_PREFETCH = 2;

let allowedPrefetchPostIds = new Set<string>();

export function setReelPrefetchScope(...postIds: (string | null | undefined)[]): void {
  allowedPrefetchPostIds = new Set(
    postIds.filter(Boolean) as string[],
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

/** Range-fetch first ~512KB for +faststart MP4 — keeps up to 2 URLs warm. */
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

  if (activeLeadBytePrefetches.has(url)) return;

  while (activeLeadBytePrefetches.size >= MAX_CONCURRENT_PREFETCH) {
    const oldest = activeLeadBytePrefetches.keys().next().value as string | undefined;
    if (!oldest) break;
    activeLeadBytePrefetches.get(oldest)?.abort();
    activeLeadBytePrefetches.delete(oldest);
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
