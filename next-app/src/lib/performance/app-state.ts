/**
 * Central performance knobs — page cache, video windowing, deferred loads.
 * Tune here instead of scattering magic numbers across components.
 */

/** Feed / reels Zustand + session cache lifetime */
export const PAGE_CACHE_TTL_MS = 30 * 60 * 1000;

/** How many reel slides keep a mounted <video> (active ± radius) */
export const REELS_VIDEO_WINDOW_RADIUS = 2;

/** Defer mounting feed video until after poster paints (LCP) */
export const FEED_VIDEO_MOUNT_DEFER_MS = 80;

/** Delay before MessagesDock opens a realtime chat subscription */
export const MESSAGES_DOCK_DEFER_MS = 5_000;

/** Defer home-feed suggestion cards until user scrolls near them */
export const FEED_SUGGESTIONS_DEFER_MS = 1_500;

/** Max profile posts per Firestore read */
export const PROFILE_POSTS_LIMIT = 40;

/** Reels / feed first-page sizes (keep in sync with hooks) */
export const FEED_PAGE_SIZE = 10;
export const REELS_PAGE_SIZE = 12;

/** Buffering longer than this → switch to lower-quality URL if available */
export const VIDEO_STALL_DOWNGRADE_MS = 800;

/** Reels: downgrade faster — TikTok/IG start from preview, not full original */
export const VIDEO_STALL_DOWNGRADE_REELS_MS = 200;
