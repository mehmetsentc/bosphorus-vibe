import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  reviveEnrichedPosts,
  reviveEvents,
  revivePosts,
  reviveStories,
} from "@/lib/cache/revive";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import type { EventDoc, StoryDoc, UserPostDoc } from "@/types";

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
};

export type PostsCache = {
  posts: EnrichedPost[];
  hasMore: boolean;
};

export type ReelsCache = {
  posts: EnrichedPost[];
  hasMore: boolean;
};

export type LastFetched = {
  profile: number;
  events: number;
  posts: number;
  reels: number;
};

type AppStoreState = {
  profileData: ProfileCache | null;
  events: EventsCache | null;
  posts: PostsCache | null;
  reels: ReelsCache | null;
  lastFetched: LastFetched;
  setProfileData: (data: ProfileCache) => void;
  clearProfileCache: () => void;
  setEvents: (data: EventsCache) => void;
  clearEventsCache: () => void;
  setPostsCache: (data: PostsCache) => void;
  appendFeedPosts: (posts: EnrichedPost[]) => void;
  clearPostsCache: () => void;
  setReelsCache: (data: ReelsCache) => void;
  appendReelsPosts: (posts: EnrichedPost[]) => void;
  removeReelPost: (postId: string) => void;
  clearReelsCache: () => void;
  resetStore: () => void;
};

const emptyLastFetched: LastFetched = {
  profile: 0,
  events: 0,
  posts: 0,
  reels: 0,
};

const initialState = {
  profileData: null as ProfileCache | null,
  events: null as EventsCache | null,
  posts: null as PostsCache | null,
  reels: null as ReelsCache | null,
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
      appendFeedPosts: (newPosts) =>
        set((state) => ({
          posts: state.posts
            ? { ...state.posts, posts: [...state.posts.posts, ...newPosts] }
            : { posts: newPosts, hasMore: true },
        })),
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
      appendReelsPosts: (newPosts) =>
        set((state) => ({
          reels: state.reels
            ? {
                ...state.reels,
                posts: [...state.reels.posts, ...newPosts],
              }
            : { posts: newPosts, hasMore: true },
        })),
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
      resetStore: () => set({ ...initialState }),
    }),
    {
      name: "bv-app-cache-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profileData: state.profileData,
        events: state.events,
        posts: state.posts,
        reels: state.reels,
        lastFetched: state.lastFetched,
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
      },
    },
  ),
);

/** Call on logout to wipe persisted cache */
export function resetAppStore(): void {
  useAppStore.getState().resetStore();
  void useAppStore.persist.clearStorage();
  useVideoSoundStore.setState({ feedMuted: true });
  void useVideoSoundStore.persist.clearStorage();
}
