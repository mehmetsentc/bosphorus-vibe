/** Default cache TTL — 30 minutes */
export const CACHE_TTL_MS = 30 * 60 * 1000;

export function isCacheExpired(
  lastFetched: number | undefined,
  ttlMs = CACHE_TTL_MS,
): boolean {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > ttlMs;
}

export function cacheKeyForUser(uid: string | undefined): string {
  return uid ?? "";
}
