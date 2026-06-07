import { Timestamp, type DocumentReference } from "firebase/firestore";
import type { Locale } from "@/i18n/detect";
import { LOCALE_BCP47 } from "@/i18n/detect";
import { getMessage } from "@/i18n/messages";

export function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export function refToId(ref: unknown): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") {
    const parts = ref.split("/");
    return parts[parts.length - 1];
  }
  if (typeof ref === "object" && ref !== null && "path" in ref) {
    const path = (ref as DocumentReference).path;
    return path.split("/").pop();
  }
  if (typeof ref === "object" && ref !== null && "id" in ref) {
    return (ref as { id: string }).id;
  }
  return undefined;
}

export function refsToIds(refs: unknown): string[] {
  if (!Array.isArray(refs)) return [];
  return refs.map(refToId).filter((id): id is string => Boolean(id));
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatTime(date: Date, locale = "en-GB"): string {
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date, locale = "en-GB"): string {
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getCountdown(target: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, expired: false };
}

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Sunday = 0 */
export function isSunday(date = new Date()): boolean {
  return date.getDay() === 0;
}

export function getTomorrowDate(date = new Date()): Date {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function formatTomorrowLabel(
  date = new Date(),
  locale: Locale = "en",
): string {
  return getTomorrowDate(date).toLocaleDateString(LOCALE_BCP47[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getDailySectionTitle(
  sunday = isSunday(),
  locale: Locale = "en",
): {
  title: string;
  subtitle?: string;
} {
  if (sunday) {
    return {
      title: getMessage(locale, "tomorrowsEvents"),
      subtitle: formatTomorrowLabel(undefined, locale),
    };
  }
  return { title: getMessage(locale, "dailySportActivities") };
}

export function getDailyRepeatLabel(locale: Locale = "en"): string {
  return getMessage(locale, "dailyRepeat");
}

/** Event_Time field → minutes (for early → late sort) */
export function parseEventTimeMinutes(timeLabel: string): number {
  const trimmed = timeLabel.trim();
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
  }
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  return 0;
}

export function normalizeCategory(category: string): string {
  return category.toLowerCase().trim();
}

/** e.g. "21:30 Sun, 6/7" */
export function formatEventSchedule(date: Date, timeLabel: string): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${timeLabel} ${weekday}, ${month}/${day}`;
}
