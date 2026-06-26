/**
 * Centralized video/image prefetch with cancellation.
 * Only one "next" clip should download at a time — stale requests abort on fast scroll.
 */

type PrefetchEntry = {
  controller: AbortController;
  url: string;
  postId?: string;
};

const activePrefetches = new Map<string, PrefetchEntry>();
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

/** @deprecated use setReelPrefetchScope */
export function setFocusedReelPostId(postId: string | null): void {
  setReelPrefetchScope(postId, null);
}

export function cancelVideoPrefetchesExcept(keepUrls: string[] = []): void {
  const keep = new Set(keepUrls.filter(Boolean));
  for (const [url, entry] of activePrefetches) {
    if (keep.has(url)) continue;
    entry.controller.abort();
    activePrefetches.delete(url);
  }
  for (const [url, controller] of activeLeadBytePrefetches) {
    if (keep.has(url)) continue;
    controller.abort();
    activeLeadBytePrefetches.delete(url);
  }
}

export function cancelAllVideoPrefetches(): void {
  cancelVideoPrefetchesExcept([]);
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

export function registerManagedPrefetch(
  url: string,
  controller: AbortController,
  postId?: string,
): void {
  const existing = activePrefetches.get(url);
  if (existing) existing.controller.abort();
  activePrefetches.set(url, { controller, url, postId });
}

export function unregisterManagedPrefetch(url: string): void {
  activePrefetches.delete(url);
}
