import { toDate } from "@/lib/utils/firestore-helpers";
import type { EventDoc, StoryDoc, StoryUserGroup, UserPostDoc } from "@/types";
import type { EnrichedPost } from "@/store/appStore";

export function revivePosts(posts: UserPostDoc[]): UserPostDoc[] {
  return posts.map((p) => ({
    ...p,
    timePosted: toDate(p.timePosted),
  }));
}

export function reviveEnrichedPosts(posts: EnrichedPost[]): EnrichedPost[] {
  return revivePosts(posts) as EnrichedPost[];
}

export function reviveEvents(events: EventDoc[]): EventDoc[] {
  return events.map((e) => ({
    ...e,
    eventDate: toDate(e.eventDate),
  }));
}

export function reviveStories(stories: StoryDoc[]): StoryDoc[] {
  return stories.map((s) => ({
    ...s,
    storyPostedAt: toDate(s.storyPostedAt),
    expiredAt: s.expiredAt ? toDate(s.expiredAt) : undefined,
  }));
}

export function reviveStoryGroups(groups: StoryUserGroup[]): StoryUserGroup[] {
  return groups.map((g) => ({
    ...g,
    latestAt: toDate(g.latestAt),
    stories: reviveStories(g.stories),
  }));
}
