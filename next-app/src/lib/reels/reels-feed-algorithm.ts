import type { UserPostDoc } from "@/types";
import { REELS_LIKE_SCORE_WEIGHT, REELS_RECENT_DAYS } from "@/lib/performance/app-state";

export type ReelsFeedPhase = "recent" | "popular";

/** Start of the rolling window for phase-1 (newest uploads). */
export function getReelsRecentWindowStart(): Date {
  const start = new Date();
  start.setDate(start.getDate() - REELS_RECENT_DAYS);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Engagement score for phase-2 ranking (views + weighted likes). */
export function reelsPopularityScore(post: UserPostDoc): number {
  const views = post.numViews ?? 0;
  const likes = post.likedByIds?.length ?? 0;
  return views + likes * REELS_LIKE_SCORE_WEIGHT;
}

export function sortPostsByReelsPopularity<T extends UserPostDoc>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const diff = reelsPopularityScore(b) - reelsPopularityScore(a);
    if (diff !== 0) return diff;
    return b.timePosted.getTime() - a.timePosted.getTime();
  });
}

export function isInReelsRecentWindow(post: UserPostDoc, windowStart = getReelsRecentWindowStart()): boolean {
  return post.timePosted.getTime() >= windowStart.getTime();
}
