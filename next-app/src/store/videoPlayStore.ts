/**
 * videoPlayStore — global video singleton.
 *
 * Tracks which video element is currently playing. When a new video requests
 * play, all other videos should pause. Each video registers itself via
 * `requestPlay(id)` and pauses when `playingId !== id`.
 */

import { create } from "zustand";

/** Pause + mute every reel video except the active post (iOS audio bleed fix). */
export function pauseAllVideosExcept(activeId: string | null): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll("video[data-reel-id]").forEach((node) => {
    const video = node as HTMLVideoElement;
    if (video.dataset.reelId === activeId) return;
    video.pause();
    video.muted = true;
    video.setAttribute("muted", "");
  });
}

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
  requestPlay: (id) => {
    pauseAllVideosExcept(id);
    set({ playingId: id });
  },
  releasePlay: (id) => {
    if (get().playingId === id) set({ playingId: null });
  },
}));
