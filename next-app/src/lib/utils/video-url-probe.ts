/**
 * Verify Firebase video URLs before playback — avoids 5–10s waits on 404s
 * and wrong guesses before falling back to huge originals.
 */

const probeCache = new Map<string, boolean>();

export function isVideoUrlProbeCached(url: string): boolean {
  return probeCache.has(url);
}

export function getVideoUrlProbeResult(url: string): boolean | undefined {
  return probeCache.get(url);
}

export function markVideoUrlProbe(url: string, ok: boolean): void {
  probeCache.set(url, ok);
}

/** HEAD with Range fallback — Firebase Storage supports both. */
export async function probeVideoUrlExists(url: string): Promise<boolean> {
  if (!url) return false;
  const cached = probeCache.get(url);
  if (cached !== undefined) return cached;

  try {
    const head = await fetch(url, { method: "HEAD", mode: "cors", cache: "force-cache" });
    if (head.ok) {
      probeCache.set(url, true);
      return true;
    }
  } catch {
    // continue to range probe
  }

  try {
    const range = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "force-cache",
      headers: { Range: "bytes=0-1" },
    });
    const ok = range.ok || range.status === 206;
    probeCache.set(url, ok);
    return ok;
  } catch {
    probeCache.set(url, false);
    return false;
  }
}

/** Probe all URLs in parallel; returns those that exist (input order preserved). */
export async function filterExistingVideoUrls(urls: string[]): Promise<string[]> {
  const unique = [...new Set(urls.filter(Boolean))];
  const results = await Promise.all(
    unique.map(async (url) => ({ url, ok: await probeVideoUrlExists(url) })),
  );
  return results.filter((r) => r.ok).map((r) => r.url);
}
