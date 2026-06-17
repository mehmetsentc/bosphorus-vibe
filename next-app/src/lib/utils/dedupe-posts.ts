/** Keep first occurrence of each post id (feed/reels pagination safety). */
export function dedupePostsById<T extends { id: string }>(posts: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const post of posts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    out.push(post);
  }
  return out;
}
