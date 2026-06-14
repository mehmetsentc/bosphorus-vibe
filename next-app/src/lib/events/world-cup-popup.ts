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
];

export function getIstanbulDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: WORLD_CUP_POPUP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Today's poster, or the latest configured day on/before today. */
export function getActiveWorldCupPopup(now = new Date()): WorldCupPopupDay | null {
  const dateKey = getIstanbulDateKey(now);
  const exact = WORLD_CUP_POPUP_DAYS.find((day) => day.date === dateKey);
  if (exact) return exact;

  const sorted = [...WORLD_CUP_POPUP_DAYS].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.find((day) => day.date <= dateKey) ?? null;
}

/** Dismiss key is always "today" so each calendar day can show once. */
export function getWorldCupPopupDismissKey(now = new Date()): string {
  return getIstanbulDateKey(now);
}

const DISMISS_PREFIX = "bosphorus-wc-popup-dismissed-";

export function isWorldCupPopupDismissed(dateKey: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${DISMISS_PREFIX}${dateKey}`) === "1";
}

export function dismissWorldCupPopup(dateKey: string): void {
  localStorage.setItem(`${DISMISS_PREFIX}${dateKey}`, "1");
}
