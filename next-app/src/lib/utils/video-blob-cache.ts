/**
 * Download small preview clips into blob: URLs so reels play from memory
 * (Instagram-style: next clip is already local when you swipe).
 */

type CacheEntry = {
  blobUrl?: string;
  promise?: Promise<string>;
  bytes?: number;
};

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 6;
const MAX_BLOB_BYTES = 25 * 1024 * 1024; // skip caching huge originals

export function getCachedVideoBlobUrl(remoteUrl: string): string | null {
  return cache.get(remoteUrl)?.blobUrl ?? null;
}

/** True when blobUrl is still the live entry for remoteUrl (not revoked by trim). */
export function isVideoBlobUrlValid(remoteUrl: string, blobUrl: string | null): boolean {
  if (!blobUrl) return false;
  return getCachedVideoBlobUrl(remoteUrl) === blobUrl;
}

export function prefetchVideoBlob(
  remoteUrl: string,
  priority: "high" | "low" = "low",
): Promise<string> | null {
  if (!remoteUrl || typeof window === "undefined") return null;

  const existing = cache.get(remoteUrl);
  if (existing?.blobUrl) return Promise.resolve(existing.blobUrl);
  if (existing?.promise) return existing.promise;

  const controller = new AbortController();
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
    });

  cache.set(remoteUrl, { promise });
  return promise;
}

function trimCache(): void {
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    const entry = cache.get(oldest);
    if (entry?.blobUrl) URL.revokeObjectURL(entry.blobUrl);
    cache.delete(oldest);
  }
}

export function warmVideoBlobs(urls: string[], priority: "high" | "low" = "low"): void {
  for (const url of urls) {
    const p = prefetchVideoBlob(url, priority);
    if (p) void p.catch(() => {});
  }
}
