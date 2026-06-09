/**
 * videoPlayStore — global video singleton.
 *
 * Tracks which video element is currently playing. When a new video requests
 * play, all other videos should pause. Each video registers itself via
 * `requestPlay(id)` and pauses when `playingId !== id`.
 */

import { create } from "zustand";

type VideoPlayState = {
  /** ID of the currently playing video (post.id or any unique string). */
  playingId: string | null;
  /** Call when a video starts playing. Stops any other playing video. */
  requestPlay: (id: string) => void;
  /** Call when a video pauses/unmounts so the slot is freed. */
  releasePlay: (id: string) => void;
};

export const useVideoPlayStore = create<VideoPlayState>()((set, get) => ({
  playingId: null,
  requestPlay: (id) => set({ playingId: id }),
  releasePlay: (id) => {
    if (get().playingId === id) set({ playingId: null });
  },
}));
