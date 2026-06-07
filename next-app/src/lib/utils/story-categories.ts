import { isStoryVideo, storyCoverUrl } from "@/lib/services/stories";
import type { StoryCategory, StoryDoc } from "@/types";

export const PROFILE_STORY_CATEGORY_IDS: StoryCategory[] = [
  "vibe",
  "reels",
  "events",
];

export const PROFILE_STORY_EMOJIS: Record<StoryCategory, string> = {
  vibe: "🌊",
  reels: "🎬",
  events: "✨",
};

export function inferStoryCategory(story: StoryDoc): StoryCategory {
  if (story.storyCategory) return story.storyCategory;
  if (story.eventId) return "events";
  if (isStoryVideo(story)) return "reels";
  return "vibe";
}

export function sortStoriesByPostedAt(
  stories: StoryDoc[],
  order: "asc" | "desc" = "asc",
): StoryDoc[] {
  return [...stories].sort((a, b) => {
    const diff = a.storyPostedAt.getTime() - b.storyPostedAt.getTime();
    return order === "asc" ? diff : -diff;
  });
}

export function groupStoriesByCategory(
  stories: StoryDoc[],
): Record<StoryCategory, StoryDoc[]> {
  const groups: Record<StoryCategory, StoryDoc[]> = {
    vibe: [],
    reels: [],
    events: [],
  };

  for (const story of stories) {
    groups[inferStoryCategory(story)].push(story);
  }

  for (const id of PROFILE_STORY_CATEGORY_IDS) {
    groups[id] = sortStoriesByPostedAt(groups[id], "asc");
  }

  return groups;
}

export type ProfileHighlightItem = {
  id: StoryCategory;
  label: string;
  emoji: string;
  cover?: string;
  count: number;
};

export function buildProfileHighlightItems(
  stories: StoryDoc[],
  labels: Record<StoryCategory, string>,
): ProfileHighlightItem[] {
  const grouped = groupStoriesByCategory(stories);

  return PROFILE_STORY_CATEGORY_IDS.map((id) => {
    const categoryStories = grouped[id];
    const latest = sortStoriesByPostedAt(categoryStories, "desc")[0];
    return {
      id,
      label: labels[id],
      emoji: PROFILE_STORY_EMOJIS[id],
      cover: latest ? storyCoverUrl(latest) : undefined,
      count: categoryStories.length,
    };
  });
}

export function parseStoryCategory(value: string | null): StoryCategory {
  if (value === "reels" || value === "events" || value === "vibe") return value;
  return "vibe";
}
