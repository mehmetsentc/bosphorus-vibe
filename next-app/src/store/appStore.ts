import { create } from "zustand";
import { dedupePostsById } from "@/lib/utils/dedupe-posts";
import { SESSION_POSTS_MAX } from "@/lib/performance/app-state";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSSRSafeLocalStorage } from "@/lib/cache/ssr-safe-storage";
import {
  PERSIST_POSTS_MAX,
  slimPostsCache,
  slimReelsCache,
} from "@/lib/cache/slim-cache";
import {
  reviveEnrichedPosts,
  reviveEvents,
  revivePosts,
  reviveStories,
  reviveStoryGroups,
} from "@/lib/cache/revive";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import type { EventDoc, StoryDoc, TeamMemberDoc, UserPostDoc, StoryUserGroup } from "@/types";

export type EnrichedPost = UserPostDoc & {
  userName?: string;
  userPhoto?: string;
};

export type ProfileCache = {
  uid: string;
  posts: UserPostDoc[];
  taggedPosts: UserPostDoc[];
  stories: StoryDoc[];
  followers: number;
  following: number;
};

export type EventsCache = {
  daily: EventDoc[];
  showTime: EventDoc[];
  weekly: EventDoc[];
};

export type PostsCache = {
  posts: EnrichedPost[];
  hasMore: boolean;
};

export type ReelsCache = {
  posts: EnrichedPost[];
  hasMore: boolean;
  phase?: "recent" | "popular";
  popularOffset?: number;
};

export type StoriesFeedCache = {
  groups: StoryUserGroup[];
};

export type LastFetched = {
  profile: number;
  events: number;
  posts: number;
  reels: number;
  storiesFeed: number;
  team: number;
};

type AppStoreState = {
  profileData: ProfileCache | null;
  events: EventsCache | null;
  posts: PostsCache | null;
  reels: ReelsCache | null;
  storiesFeed: StoriesFeedCache | null;
  team: TeamMemberDoc[] | null;
  lastFetched: LastFetched;
  setProfileData: (data: ProfileCache) => void;
  clearProfileCache: () => void;
  setEvents: (data: EventsCache) => void;
  clearEventsCache: () => void;
  setPostsCache: (data: PostsCache) => void;
  appendFeedPosts: (posts: EnrichedPost[], hasMore?: boolean) => void;
  clearPostsCache: () => void;
  setReelsCache: (data: ReelsCache) => void;
  appendReelsPosts: (posts: EnrichedPost[], hasMore?: boolean) => void;
  removeReelPost: (postId: string) => void;
  clearReelsCache: () => void;
  setStoriesFeedCache: (groups: StoryUserGroup[]) => void;
  clearStoriesFeedCache: () => void;
  setTeamCache: (members: TeamMemberDoc[]) => void;
  clearTeamCache: () => void;
  resetStore: () => void;
};

const emptyLastFetched: LastFetched = {
  profile: 0,
  events: 0,
  posts: 0,
  reels: 0,
  storiesFeed: 0,
  team: 0,
};

const initialState = {
  profileData: null as ProfileCache | null,
  events: null as EventsCache | null,
  posts: null as PostsCache | null,
  reels: null as ReelsCache | null,
  storiesFeed: null as StoriesFeedCache | null,
  team: null as TeamMemberDoc[] | null,
  lastFetched: { ...emptyLastFetched },
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      setProfileData: (data) =>
        set((state) => ({
          profileData: data,
          lastFetched: { ...state.lastFetched, profile: Date.now() },
        })),
      clearProfileCache: () =>
        set((state) => ({
          profileData: null,
          lastFetched: { ...state.lastFetched, profile: 0 },
        })),
      setEvents: (data) =>
        set((state) => ({
          events: data,
          lastFetched: { ...state.lastFetched, events: Date.now() },
        })),
      clearEventsCache: () =>
        set((state) => ({
          events: null,
          lastFetched: { ...state.lastFetched, events: 0 },
        })),
      setPostsCache: (data) =>
        set((state) => ({
          posts: data,
          lastFetched: { ...state.lastFetched, posts: Date.now() },
        })),
      appendFeedPosts: (newPosts, hasMore) =>
        set((state) => {
          const merged = state.posts
            ? [...state.posts.posts, ...newPosts]
            : newPosts;
          const deduped = dedupePostsById(merged);
          return {
            posts: {
              posts: deduped.slice(-SESSION_POSTS_MAX),
              hasMore: hasMore ?? state.posts?.hasMore ?? true,
            },
          };
        }),
      clearPostsCache: () =>
        set((state) => ({
          posts: null,
          lastFetched: { ...state.lastFetched, posts: 0 },
        })),
      setReelsCache: (data) =>
        set((state) => ({
          reels: data,
          lastFetched: { ...state.lastFetched, reels: Date.now() },
        })),
      appendReelsPosts: (newPosts, hasMore) =>
        set((state) => {
          const merged = state.reels
            ? [...state.reels.posts, ...newPosts]
            : newPosts;
          const deduped = dedupePostsById(merged);
          return {
            reels: {
              posts: deduped.slice(-SESSION_POSTS_MAX),
              hasMore: hasMore ?? state.reels?.hasMore ?? true,
              phase: state.reels?.phase,
              popularOffset: state.reels?.popularOffset,
            },
          };
        }),
      removeReelPost: (postId) =>
        set((state) => ({
          reels: state.reels
            ? {
                ...state.reels,
                posts: state.reels.posts.filter((p) => p.id !== postId),
              }
            : null,
        })),
      clearReelsCache: () =>
        set((state) => ({
          reels: null,
          lastFetched: { ...state.lastFetched, reels: 0 },
        })),
      setStoriesFeedCache: (groups) =>
        set((state) => ({
          storiesFeed: { groups },
          lastFetched: { ...state.lastFetched, storiesFeed: Date.now() },
        })),
      clearStoriesFeedCache: () =>
        set((state) => ({
          storiesFeed: null,
          lastFetched: { ...state.lastFetched, storiesFeed: 0 },
        })),
      setTeamCache: (members) =>
        set((state) => ({
          team: members,
          lastFetched: { ...state.lastFetched, team: Date.now() },
        })),
      clearTeamCache: () =>
        set((state) => ({
          team: null,
          lastFetched: { ...state.lastFetched, team: 0 },
        })),
      resetStore: () => set({ ...initialState }),
    }),
    {
      name: "bv-app-cache-v1",
      storage: createJSONStorage(createSSRSafeLocalStorage),
      partialize: (state) => ({
        profileData: state.profileData
          ? {
              ...state.profileData,
              posts: state.profileData.posts.slice(0, PERSIST_POSTS_MAX * 2),
              taggedPosts: state.profileData.taggedPosts.slice(0, PERSIST_POSTS_MAX),
            }
          : null,
        events: state.events,
        posts: slimPostsCache(state.posts),
        reels: slimReelsCache(state.reels),
        storiesFeed: state.storiesFeed
          ? {
              groups: state.storiesFeed.groups.slice(0, 24).map((g) => ({
                ...g,
                stories: g.stories.slice(0, 8),
              })),
            }
          : null,
        // Intentionally omit `team` — roster must stay fresh after admin role edits.
        lastFetched: {
          ...state.lastFetched,
          team: 0,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.profileData) {
          state.profileData = {
            ...state.profileData,
            posts: revivePosts(state.profileData.posts),
            taggedPosts: revivePosts(state.profileData.taggedPosts),
            stories: reviveStories(state.profileData.stories),
          };
        }
        if (state.events) {
          state.events = {
            daily: reviveEvents(state.events.daily),
            showTime: reviveEvents(state.events.showTime),
            weekly: reviveEvents(state.events.weekly ?? []),
          };
        }
        if (state.posts) {
          state.posts = {
            ...state.posts,
            posts: reviveEnrichedPosts(state.posts.posts),
          };
        }
        if (state.reels) {
          state.reels = {
            ...state.reels,
            posts: reviveEnrichedPosts(state.reels.posts),
          };
        }
        if (state.storiesFeed) {
          state.storiesFeed = {
            groups: reviveStoryGroups(state.storiesFeed.groups),
          };
        }
      },
    },
  ),
);

/** Call on logout to wipe persisted cache */
export function resetAppStore(): void {
  useAppStore.getState().resetStore();
  void useAppStore.persist?.clearStorage();
  useVideoSoundStore.setState({ feedMuted: true, reelsMuted: false });
  void useVideoSoundStore.persist?.clearStorage();
}
