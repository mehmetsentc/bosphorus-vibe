/**
 * Central performance knobs — page cache, video windowing, deferred loads.
 * Tune here instead of scattering magic numbers across components.
 */

/** Feed / reels Zustand + session cache lifetime */
export const PAGE_CACHE_TTL_MS = 30 * 60 * 1000;

/** How many reel slides keep a mounted <video> (active ± radius). iOS caps ~4 decoders. */
export const REELS_VIDEO_WINDOW_RADIUS = 1;

/** Reel DOM shells rendered outside the video window (poster-only buffer). */
export const REELS_DOM_WINDOW_RADIUS = 2;

/** Max posts kept in session memory (feed + reels append). Older pages drop off. */
export const SESSION_POSTS_MAX = 120;

/** Max concurrent poster prefetches per feed card */
export const FEED_POSTER_PREFETCH_MAX = 2;

/** Virtual feed row height estimate (px) — remeasured on mount */
export const FEED_VIRTUAL_ROW_ESTIMATE_PX = 620;

/** Instagram feed portrait ratio (4:5) — width:height */
export const FEED_VIDEO_ASPECT_CLASS = "aspect-[4/5]";

/** Min visible fraction before a feed video may autoplay (single winner) */
export const FEED_VIDEO_AUTOPLAY_MIN_RATIO = 0.55;

/** Reels phase-1: show uploads from the last N days (newest first) */
export const REELS_RECENT_DAYS = 7;

/** Likes weighted higher than raw views in reels popular ranking */
export const REELS_LIKE_SCORE_WEIGHT = 12;

/** Preload video metadata when card is this fraction visible */
export const FEED_VIDEO_PRELOAD_MIN_RATIO = 0.08;

/** Defer mounting feed video until after poster paints (LCP) */
export const FEED_VIDEO_MOUNT_DEFER_MS = 80;

/** Delay before MessagesDock opens a realtime chat subscription */
export const MESSAGES_DOCK_DEFER_MS = 5_000;

/** Defer home-feed suggestion cards until user scrolls near them */
export const FEED_SUGGESTIONS_DEFER_MS = 1_500;

/** Max profile posts per Firestore read */
export const PROFILE_POSTS_LIMIT = 40;

/** Reels / feed first-page sizes (keep in sync with hooks) */
export const FEED_PAGE_SIZE = 15;
export const REELS_PAGE_SIZE = 20;

/** Trigger load-more / catalog cycle this many items before the end */
export const INFINITE_SCROLL_NEAR_END = 3;

/** Buffering longer than this → switch to lower-quality URL if available */
export const VIDEO_STALL_DOWNGRADE_MS = 800;

/** Reels: downgrade faster — TikTok/IG start from preview, not full original */
export const VIDEO_STALL_DOWNGRADE_REELS_MS = 200;

/** Reels: switch URL if first frame not reached within this window */
export const REELS_FIRST_FRAME_TIMEOUT_MS = 1_500;
