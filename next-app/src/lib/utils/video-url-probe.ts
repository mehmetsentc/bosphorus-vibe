/**
 * Optional URL existence hints — never block playback on inconclusive results.
 * Only cache definitive success (2xx) or hard failures (403/404).
 */

const probeCache = new Map<string, boolean>();

export function isVideoUrlProbeCached(url: string): boolean {
  return probeCache.get(url) === true;
}

export function getVideoUrlProbeResult(url: string): boolean | undefined {
  return probeCache.get(url);
}

export function markVideoUrlProbe(url: string, ok: boolean): void {
  if (ok) probeCache.set(url, true);
  else probeCache.set(url, false);
}

function isHardNotFound(status: number): boolean {
  return status === 404 || status === 403;
}

/** HEAD with Range fallback — inconclusive results are NOT cached as false. */
export async function probeVideoUrlExists(url: string): Promise<boolean> {
  if (!url) return false;
  if (probeCache.get(url) === true) return true;
  if (probeCache.get(url) === false) return false;

  try {
    const head = await fetch(url, { method: "HEAD", mode: "cors", cache: "force-cache" });
    if (head.ok) {
      probeCache.set(url, true);
      return true;
    }
    if (isHardNotFound(head.status)) {
      probeCache.set(url, false);
      return false;
    }
  } catch {
    // CORS/network — inconclusive
  }

  try {
    const range = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "force-cache",
      headers: { Range: "bytes=0-1" },
    });
    if (range.ok || range.status === 206) {
      probeCache.set(url, true);
      return true;
    }
    if (isHardNotFound(range.status)) {
      probeCache.set(url, false);
      return false;
    }
  } catch {
    // inconclusive — do not cache false
  }

  return false;
}

/** Probe all URLs in parallel; returns those that exist (input order preserved). */
export async function filterExistingVideoUrls(urls: string[]): Promise<string[]> {
  const unique = [...new Set(urls.filter(Boolean))];
  const results = await Promise.all(
    unique.map(async (url) => ({ url, ok: await probeVideoUrlExists(url) })),
  );
  return results.filter((r) => r.ok).map((r) => r.url);
}

/** Fire-and-forget probe — promotes confirmed URLs only; never removes candidates. */
export function probeVideoUrlsInBackground(
  urls: string[],
  onComplete?: (existing: string[]) => void,
): () => void {
  const unique = [...new Set(urls.filter(Boolean))];
  if (!unique.length) return () => {};

  let cancelled = false;
  void filterExistingVideoUrls(unique).then((existing) => {
    if (!cancelled) onComplete?.(existing);
  });

  return () => {
    cancelled = true;
  };
}
