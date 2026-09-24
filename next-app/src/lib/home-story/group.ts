import type { EnrichedPost } from "@/store/appStore";

export const HOME_STORY_LIMIT = 10;

export type HomeStoryGroup = {
  userId: string;
  userName: string;
  userPhoto?: string;
  posts: EnrichedPost[];
  newestAt: number;
};

/** Newest uploader first. Each user keeps their latest 10 posts, newest first. */
export function groupHomeStoryPosts(posts: EnrichedPost[]): HomeStoryGroup[] {
  const sorted = [...posts].sort(
    (a, b) => b.timePosted.getTime() - a.timePosted.getTime(),
  );
  const seen = new Set<string>();
  const buckets = new Map<string, EnrichedPost[]>();

  for (const post of sorted) {
    if (!post.id || seen.has(post.id)) continue;
    seen.add(post.id);
    const userId = post.postUserId || `post:${post.id}`;
    const bucket = buckets.get(userId) ?? [];
    if (bucket.length >= HOME_STORY_LIMIT) continue;
    bucket.push(post);
    buckets.set(userId, bucket);
  }

  const groups: HomeStoryGroup[] = [];
  for (const [userId, userPosts] of buckets) {
    const head = userPosts[0];
    if (!head) continue;
    groups.push({
      userId,
      userName: head.userName || "user",
      userPhoto: head.userPhoto,
      posts: userPosts,
      newestAt: head.timePosted.getTime(),
    });
  }

  groups.sort((a, b) => b.newestAt - a.newestAt);
  return groups;
}
