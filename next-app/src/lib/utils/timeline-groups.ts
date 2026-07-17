import { isToday } from "@/lib/utils/firestore-helpers";
import type { MessageKey } from "@/i18n/messages/en";
import type { EnrichedPost } from "@/store/appStore";

export type TimelineDayGroup = {
  key: string;
  label: string;
  posts: EnrichedPost[];
};

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDayLabel(date: Date, locale: string, t: (key: MessageKey) => string): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isToday(date)) return t("timelineToday");
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return t("timelineYesterday");
  }

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
}

/** Chronological timeline groups — newest day first, posts newest-first within day. */
export function groupPostsByTimelineDay(
  posts: EnrichedPost[],
  locale: string,
  t: (key: MessageKey) => string,
): TimelineDayGroup[] {
  const sorted = [...posts].sort(
    (a, b) => b.timePosted.getTime() - a.timePosted.getTime(),
  );

  const map = new Map<string, EnrichedPost[]>();
  for (const post of sorted) {
    const key = dayKey(post.timePosted);
    const bucket = map.get(key);
    if (bucket) bucket.push(post);
    else map.set(key, [post]);
  }

  return Array.from(map.entries()).map(([key, dayPosts]) => ({
    key,
    label: formatDayLabel(dayPosts[0]!.timePosted, locale, t),
    posts: dayPosts,
  }));
}

export function formatTimelineClock(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Compact relative time for feed headers (e.g. now, 5m, 3h, Yesterday). */
export function formatFeedRelativeTime(
  date: Date,
  locale: string,
  t: (key: MessageKey, vars?: Record<string, string>) => string,
): string {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffSec < 60) return t("timelineJustNow");
  if (diffSec < 3600) {
    return t("timelineMinutesAgo", { n: String(Math.floor(diffSec / 60)) });
  }
  if (diffSec < 86400) {
    return t("timelineHoursAgo", { n: String(Math.floor(diffSec / 3600)) });
  }
  if (diffSec < 172800) return t("timelineYesterday");

  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}
