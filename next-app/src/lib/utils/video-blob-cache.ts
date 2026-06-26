/**
 * LRU blob cache for preview clips — next reel plays from memory on swipe.
 * Aborts in-flight downloads when user scrolls away (Instagram-style).
 */

import {
  registerManagedPrefetch,
  unregisterManagedPrefetch,
} from "@/lib/performance/video-prefetch-manager";
import { recordPrefetchCancel } from "@/lib/performance/video-metrics";

type CacheEntry = {
  blobUrl?: string;
  promise?: Promise<string>;
  bytes?: number;
  controller?: AbortController;
};

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 3;
const MAX_BLOB_BYTES = 12 * 1024 * 1024;

export function getCachedVideoBlobUrl(remoteUrl: string): string | null {
  return cache.get(remoteUrl)?.blobUrl ?? null;
}

export function isVideoBlobUrlValid(remoteUrl: string, blobUrl: string | null): boolean {
  if (!blobUrl) return false;
  return getCachedVideoBlobUrl(remoteUrl) === blobUrl;
}

export function cancelVideoBlobPrefetch(remoteUrl: string): void {
  const entry = cache.get(remoteUrl);
  if (!entry) return;
  entry.controller?.abort();
  if (entry.promise && !entry.blobUrl) {
    cache.delete(remoteUrl);
    recordPrefetchCancel(remoteUrl);
  }
}

export function cancelAllVideoBlobPrefetchesExcept(keepUrls: string[] = []): void {
  const keep = new Set(keepUrls.filter(Boolean));
  for (const url of cache.keys()) {
    if (keep.has(url)) continue;
    cancelVideoBlobPrefetch(url);
  }
}

export function prefetchVideoBlob(
  remoteUrl: string,
  priority: "high" | "low" = "low",
  postId?: string,
): Promise<string> | null {
  if (!remoteUrl || typeof window === "undefined") return null;

  const existing = cache.get(remoteUrl);
  if (existing?.blobUrl) return Promise.resolve(existing.blobUrl);
  if (existing?.promise) return existing.promise;

  const controller = new AbortController();
  registerManagedPrefetch(remoteUrl, controller, postId);

  const promise = fetch(remoteUrl, {
    signal: controller.signal,
    cache: "force-cache",
    priority: priority === "high" ? "high" : "low",
  } as RequestInit)
    .then(async (res) => {
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const blob = await res.blob();
      if (blob.size > MAX_BLOB_BYTES) {
        cache.delete(remoteUrl);
        throw new Error("too large");
      }
      const blobUrl = URL.createObjectURL(blob);
      cache.set(remoteUrl, { blobUrl, bytes: blob.size });
      trimCache();
      return blobUrl;
    })
    .catch(() => {
      cache.delete(remoteUrl);
      throw new Error("prefetch failed");
    })
    .finally(() => {
      unregisterManagedPrefetch(remoteUrl);
    });

  cache.set(remoteUrl, { promise, controller });
  return promise;
}

function trimCache(): void {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    const entry = cache.get(oldest);
    entry?.controller?.abort();
    if (entry?.blobUrl) URL.revokeObjectURL(entry.blobUrl);
    cache.delete(oldest);
  }
}

/** Prefetch only the next reel preview into blob memory. */
export function warmNextReelBlob(url: string, postId?: string): void {
  if (!url) return;
  cancelAllVideoBlobPrefetchesExcept([url]);
  const p = prefetchVideoBlob(url, "high", postId);
  if (p) void p.catch(() => {});
}

export function warmVideoBlobs(urls: string[], priority: "high" | "low" = "low"): void {
  for (const url of urls.slice(0, 1)) {
    const p = prefetchVideoBlob(url, priority);
    if (p) void p.catch(() => {});
  }
}
