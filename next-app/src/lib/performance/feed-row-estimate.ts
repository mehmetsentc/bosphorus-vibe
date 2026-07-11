import { getPostVideoUrl } from "@/lib/services/firestore";
import type { UserPostDoc } from "@/types";

/** Feed card chrome below media (header + actions + caption padding). */
const FEED_CARD_CHROME_PX = 168;

/** Default portrait ratio when metadata missing (matches FeedPostCard). */
const DEFAULT_VIDEO_ASPECT = 9 / 16;

/** Max feed column width — matches FeedPageLayout max-w-[470px]. */
const FEED_COLUMN_MAX_PX = 470;

function feedColumnWidth(): number {
  if (typeof window === "undefined") return 390;
  return Math.min(window.innerWidth, FEED_COLUMN_MAX_PX);
}

/** Estimate virtual row height from post media type and aspect. */
export function estimateFeedPostRowPx(post?: UserPostDoc): number {
  const width = feedColumnWidth();
  if (!post || !getPostVideoUrl(post)) {
    return Math.round(width + FEED_CARD_CHROME_PX);
  }

  const w = post.videoWidth;
  const h = post.videoHeight;
  const ratio = w && h && h > 0 ? w / h : DEFAULT_VIDEO_ASPECT;
  const mediaHeight = width / ratio;
  return Math.round(mediaHeight + FEED_CARD_CHROME_PX);
}
