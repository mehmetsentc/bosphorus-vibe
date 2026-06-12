import { useAppStore } from "@/store/appStore";

const REELS_REFRESH_KEY = "bv-refresh-reels";

/** Clear cached home feed and/or reels after a new upload. */
export function invalidateFeedCaches(opts?: { feed?: boolean; reels?: boolean }) {
  const store = useAppStore.getState();
  if (opts?.feed !== false) store.clearPostsCache();
  if (opts?.reels !== false) store.clearReelsCache();
}

/** Reels page reads this flag and forces a fresh fetch on next visit. */
export function markReelsRefreshPending() {
  try {
    sessionStorage.setItem(REELS_REFRESH_KEY, "1");
  } catch {
    /* private browsing */
  }
}

export function consumeReelsRefreshPending(): boolean {
  try {
    if (sessionStorage.getItem(REELS_REFRESH_KEY) !== "1") return false;
    sessionStorage.removeItem(REELS_REFRESH_KEY);
    return true;
  } catch {
    return false;
  }
}
