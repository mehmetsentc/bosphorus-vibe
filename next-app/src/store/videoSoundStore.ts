import { create } from "zustand";
import { persist } from "zustand/middleware";

type VideoSoundState = {
  /** User preference for reel / full-screen video feeds */
  feedMuted: boolean;
  setFeedMuted: (muted: boolean) => void;
  toggleFeedMuted: () => boolean;
};

export const useVideoSoundStore = create<VideoSoundState>()(
  persist(
    (set, get) => ({
      feedMuted: true,
      setFeedMuted: (muted) => set({ feedMuted: muted }),
      toggleFeedMuted: () => {
        const next = !get().feedMuted;
        set({ feedMuted: next });
        return next;
      },
    }),
    {
      name: "bv-video-sound-v1",
      partialize: (state) => ({ feedMuted: state.feedMuted }),
    },
  ),
);
