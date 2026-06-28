/**
 * Feed video coordinator — Instagram-style single active video.
 * Only the post with the highest visible area ratio autoplays.
 */

import { create } from "zustand";
import { FEED_VIDEO_AUTOPLAY_MIN_RATIO } from "@/lib/performance/app-state";
import { pauseAllFeedVideosExcept } from "@/store/videoPlayStore";

type FeedVideoState = {
  activePostId: string | null;
  ratios: Record<string, number>;
  reportVisibility: (postId: string, ratio: number) => void;
  clearVisibility: (postId: string) => void;
};

function pickActivePostId(ratios: Record<string, number>): string | null {
  let bestId: string | null = null;
  let bestRatio = -1;

  for (const [id, ratio] of Object.entries(ratios)) {
    if (ratio >= FEED_VIDEO_AUTOPLAY_MIN_RATIO && ratio > bestRatio) {
      bestRatio = ratio;
      bestId = id;
    }
  }

  return bestId;
}

export const useFeedVideoStore = create<FeedVideoState>((set, get) => ({
  activePostId: null,
  ratios: {},

  reportVisibility: (postId, ratio) => {
    const next = { ...get().ratios };
    if (ratio <= 0.001) {
      delete next[postId];
    } else {
      next[postId] = ratio;
    }

    const activePostId = pickActivePostId(next);
    const prevActive = get().activePostId;

    if (activePostId !== prevActive) {
      pauseAllFeedVideosExcept(activePostId);
    }

    set({ ratios: next, activePostId });
  },

  clearVisibility: (postId) => {
    const next = { ...get().ratios };
    delete next[postId];
    const activePostId = pickActivePostId(next);
    if (activePostId !== get().activePostId) {
      pauseAllFeedVideosExcept(activePostId);
    }
    set({ ratios: next, activePostId });
  },
}));
