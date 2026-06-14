import { create } from "zustand";
import { persist } from "zustand/middleware";

type VideoSoundState = {
  /** Inline feed preview — muted for reliable autoplay on mobile */
  feedMuted: boolean;
  /** Full-screen reels — sound on by default */
  reelsMuted: boolean;
  setFeedMuted: (muted: boolean) => void;
  setReelsMuted: (muted: boolean) => void;
  toggleFeedMuted: () => boolean;
  toggleReelsMuted: () => boolean;
};

export const useVideoSoundStore = create<VideoSoundState>()(
  persist(
    (set, get) => ({
      feedMuted: true,
      reelsMuted: false,
      setFeedMuted: (muted) => set({ feedMuted: muted }),
      setReelsMuted: (muted) => set({ reelsMuted: muted }),
      toggleFeedMuted: () => {
        const next = !get().feedMuted;
        set({ feedMuted: next });
        return next;
      },
      toggleReelsMuted: () => {
        const next = !get().reelsMuted;
        set({ reelsMuted: next });
        return next;
      },
    }),
    {
      name: "bv-video-sound-v2",
      partialize: (state) => ({
        feedMuted: state.feedMuted,
        reelsMuted: state.reelsMuted,
      }),
      migrate: (persisted) => {
        const prev = persisted as { feedMuted?: boolean } | undefined;
        return {
          feedMuted: prev?.feedMuted ?? true,
          reelsMuted: false,
        };
      },
      version: 2,
    },
  ),
);
