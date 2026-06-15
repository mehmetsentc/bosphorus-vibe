/**
 * Daily World Cup popup on Events routes (/events and /events/[id]).
 *
 * To add a new day:
 * 1. Drop image at public/events/world-cup/YYYY-MM-DD.png (or .jpg)
 * 2. Append an entry below with the same date (Europe/Istanbul).
 * Popup shows on that calendar day until 00:00 the next day.
 */

export type WorldCupPopupDay = {
  /** YYYY-MM-DD in Europe/Istanbul */
  date: string;
  imageSrc: string;
  alt: string;
};

export const WORLD_CUP_POPUP_TIMEZONE = "Europe/Istanbul";

/** Istanbul calendar dates (inclusive) when the popup may appear. */
export const WORLD_CUP_SEASON = {
  start: "2026-06-11",
  end: "2026-07-19",
} as const;

export const WORLD_CUP_POPUP_DAYS: WorldCupPopupDay[] = [
  {
    date: "2026-06-13",
    imageSrc: "/events/world-cup/2026-06-13.png",
    alt: "FIFA World Cup 2026 — Bosphorus Sorgun günlük özet (13 Haziran)",
  },
  {
    date: "2026-06-14",
    imageSrc: "/events/world-cup/2026-06-14.png",
    alt: "FIFA World Cup 2026 — Bosphorus Sorgun günlük özet (14 Haziran)",
  },
  {
    date: "2026-06-15",
    imageSrc: "/events/world-cup/2026-06-15.png",
    alt: "FIFA World Cup 2026 — Bosphorus Sorgun günlük özet (15 Haziran)",
  },
  {
    date: "2026-06-16",
    imageSrc: "/events/world-cup/2026-06-16.png",
    alt: "FIFA World Cup 2026 — Bosphorus Sorgun günlük özet (16 Haziran)",
  },
];

export function getIstanbulDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WORLD_CUP_POPUP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isWorldCupSeason(now = new Date()): boolean {
  const dateKey = getIstanbulDateKey(now);
  return dateKey >= WORLD_CUP_SEASON.start && dateKey <= WORLD_CUP_SEASON.end;
}

/** Today's poster, latest on/before today, or first configured poster early in the season. */
export function getActiveWorldCupPopup(now = new Date()): WorldCupPopupDay | null {
  if (!isWorldCupSeason(now)) return null;

  const dateKey = getIstanbulDateKey(now);
  const exact = WORLD_CUP_POPUP_DAYS.find((day) => day.date === dateKey);
  if (exact) return exact;

  const sortedDesc = [...WORLD_CUP_POPUP_DAYS].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const latest = sortedDesc.find((day) => day.date <= dateKey);
  if (latest) return latest;

  const sortedAsc = [...WORLD_CUP_POPUP_DAYS].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return sortedAsc[0] ?? null;
}

/** Max automatic opens per poster per Istanbul calendar day (per user). */
export const WORLD_CUP_DAILY_AUTO_OPEN_LIMIT = 3;

/** Session key: poster date + viewer's Istanbul calendar day. */
export function getWorldCupPopupSessionKey(
  popup: WorldCupPopupDay,
  now = new Date(),
): string {
  return `${popup.date}@${getIstanbulDateKey(now)}`;
}

const DISMISS_PREFIX = "bosphorus-wc-popup-dismissed-";

export function getWorldCupPopupCloseCount(sessionKey: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`${DISMISS_PREFIX}${sessionKey}`);
  if (!raw) return 0;
  if (raw === "1") return 1;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function canAutoOpenWorldCupPopup(
  popup: WorldCupPopupDay,
  now = new Date(),
): boolean {
  const key = getWorldCupPopupSessionKey(popup, now);
  return getWorldCupPopupCloseCount(key) < WORLD_CUP_DAILY_AUTO_OPEN_LIMIT;
}

export function recordWorldCupPopupClose(
  popup: WorldCupPopupDay,
  now = new Date(),
): void {
  const key = getWorldCupPopupSessionKey(popup, now);
  const next = getWorldCupPopupCloseCount(key) + 1;
  localStorage.setItem(`${DISMISS_PREFIX}${key}`, String(next));
}
