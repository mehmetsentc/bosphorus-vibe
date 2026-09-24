import type { UserPostDoc } from "@/types";

/** Client-only rank. Uses fields already stored on the post. */
export function akisScore(post: UserPostDoc, now = Date.now()): number {
  const ageHours = Math.max(0, (now - post.timePosted.getTime()) / 3_600_000);
  const recency = 1 / (1 + ageHours / 12);
  const likes = post.likedByIds.length;
  const comments = post.numComments ?? 0;
  const views = post.numViews ?? 0;
  return recency * 100 + likes * 4 + comments * 3 + Math.log1p(views);
}

export function sortAkisPage<T extends UserPostDoc>(posts: T[], now = Date.now()): T[] {
  return [...posts].sort((a, b) => akisScore(b, now) - akisScore(a, now));
}
