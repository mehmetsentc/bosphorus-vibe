/**
 * Tracks which posts the user has viewed (feed + reels).
 * Persists in localStorage per user; recycles when every loaded post was seen.
 */

const MAX_SEEN = 2000;
/** Fetch next page when fewer than this many displayable posts remain. */
const MIN_UNSEEN_BEFORE_LOAD = 5;

function storageKey(userId?: string): string {
  return `bv_seen_posts_${userId || "guest"}`;
}

function readSeen(userId?: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(seen).slice(-MAX_SEEN);
    localStorage.setItem(storageKey(userId), JSON.stringify(arr));
  } catch {}
}

export function markPostSeen(id: string, userId?: string): void {
  if (!id || typeof window === "undefined") return;
  const seen = readSeen(userId);
  if (seen.has(id)) return;
  seen.add(id);
  writeSeen(seen, userId);
}

export function markPostsSeen(ids: string[], userId?: string): void {
  if (typeof window === "undefined") return;
  const seen = readSeen(userId);
  let changed = false;
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    changed = true;
  }
  if (changed) writeSeen(seen, userId);
}

export function clearSeenForIds(ids: string[], userId?: string): void {
  if (typeof window === "undefined") return;
  const seen = readSeen(userId);
  let changed = false;
  for (const id of ids) {
    if (seen.delete(id)) changed = true;
  }
  if (changed) writeSeen(seen, userId);
}

export function getSeenPostIds(userId?: string): Set<string> {
  return readSeen(userId);
}

export type DisplayPostsOptions = {
  /** Always include these IDs even if marked seen (e.g. tapped post in reels). */
  pinIds?: string[];
};

/**
 * Returns posts the user has not seen yet. When every post in the batch was
 * seen, clears seen flags for that batch and returns all (Instagram/TikTok recycle).
 */
export function getDisplayPosts<T extends { id: string }>(
  posts: T[],
  userId?: string,
  options?: DisplayPostsOptions,
): T[] {
  if (!posts.length) return posts;

  const pinSet = new Set(options?.pinIds ?? []);
  const seen = getSeenPostIds(userId);
  const unseen = posts.filter((p) => !seen.has(p.id) || pinSet.has(p.id));

  if (unseen.length > 0) return unseen;

  clearSeenForIds(posts.map((p) => p.id), userId);
  return posts;
}

/** Trigger loadMore when the unseen pool runs low. */
export function shouldLoadMoreForUnseen(
  displayCount: number,
  hasMore: boolean,
): boolean {
  return hasMore && displayCount < MIN_UNSEEN_BEFORE_LOAD;
}

/** After refresh, paginate until enough unseen posts are available. */
export async function fillUnseenPages(
  filterPosts: <T extends { id: string }>(posts: T[]) => T[],
  getPosts: () => { id: string }[],
  getHasMore: () => boolean,
  loadMore: () => Promise<void>,
  maxPages = 10,
): Promise<void> {
  for (let i = 0; i < maxPages; i++) {
    const display = filterPosts(getPosts());
    if (display.length >= MIN_UNSEEN_BEFORE_LOAD || !getHasMore()) return;
    await loadMore();
  }
}

/** @deprecated Use getDisplayPosts — kept for any legacy callers. */
export function sortPostsByUnseen<T extends { id: string }>(posts: T[]): T[] {
  return getDisplayPosts(posts);
}
