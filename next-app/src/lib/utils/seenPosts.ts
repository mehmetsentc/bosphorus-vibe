/**
 * Tracks which post IDs the user has seen this session.
 * Uses sessionStorage so it resets when the app is closed/reopened.
 * Max 500 IDs stored to bound memory usage.
 */

const SESSION_KEY = "bv_seen_posts";
const MAX_SEEN = 500;

function readSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSeen(seen: Set<string>): void {
  try {
    const arr = Array.from(seen).slice(-MAX_SEEN);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(arr));
  } catch {}
}

export function markPostsSeen(ids: string[]): void {
  if (typeof window === "undefined") return;
  const seen = readSeen();
  ids.forEach((id) => seen.add(id));
  writeSeen(seen);
}

export function getSeenPostIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return readSeen();
}

/**
 * Sorts posts so unseen ones come first (in original order),
 * then seen ones (in original order). Newest-first within each group
 * since Firestore already returns them that way.
 */
export function sortPostsByUnseen<T extends { id: string }>(posts: T[]): T[] {
  const seen = getSeenPostIds();
  const unseen: T[] = [];
  const seenPosts: T[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) seenPosts.push(p);
    else unseen.push(p);
  }
  return [...unseen, ...seenPosts];
}
