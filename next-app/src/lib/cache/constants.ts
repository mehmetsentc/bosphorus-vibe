import { PAGE_CACHE_TTL_MS } from "@/lib/performance/app-state";

/** Default cache TTL — 30 minutes */
export const CACHE_TTL_MS = PAGE_CACHE_TTL_MS;

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
