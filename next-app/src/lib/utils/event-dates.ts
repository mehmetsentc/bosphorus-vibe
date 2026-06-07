import type { Locale } from "@/i18n/detect";
import { LOCALE_BCP47 } from "@/i18n/detect";
import type { EventDoc } from "@/types";

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Next N days starting from `from` (inclusive). */
export function getDateStrip(from = new Date(), count = 14): Date[] {
  const start = startOfDay(from);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatDateStripDay(date: Date, locale: Locale = "en"): string {
  return date.toLocaleDateString(LOCALE_BCP47[locale], { weekday: "short" });
}

export function formatEventListDate(date: Date, locale: Locale = "en"): string {
  return date.toLocaleDateString(LOCALE_BCP47[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEventTimeForDate(
  timeLabel: string,
  date: Date,
  locale: Locale = "en",
): string {
  return `${formatEventListDate(date, locale)} · ${timeLabel}`;
}

/** Parse "21:30" or "9:30 pm" → minutes from midnight. */
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

export function getEventOccurrenceOnDay(event: EventDoc, day: Date): Date {
  const occurrence = startOfDay(day);
  const minutes = parseEventTimeMinutes(event.eventTimeLabel);
  occurrence.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return occurrence;
}

function isDailyCategory(event: EventDoc): boolean {
  return event.eventCategory.trim().toLowerCase() === "daily";
}

/** Next future occurrence; null if no upcoming slot. */
export function getNextEventOccurrence(
  event: EventDoc,
  now = new Date(),
): Date | null {
  if (isDailyCategory(event)) {
    let cursor = startOfDay(now);
    if (cursor.getDay() === 0) {
      cursor.setDate(cursor.getDate() + 1);
    }
    for (let i = 0; i < 8; i++) {
      if (cursor.getDay() === 0) {
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }
      const occurrence = getEventOccurrenceOnDay(event, cursor);
      if (occurrence.getTime() > now.getTime()) return occurrence;
      cursor.setDate(cursor.getDate() + 1);
      cursor = startOfDay(cursor);
    }
    return null;
  }

  const byLabel = getEventOccurrenceOnDay(event, event.eventDate);
  if (byLabel.getTime() > now.getTime()) return byLabel;
  if (event.eventDate.getTime() > now.getTime()) return event.eventDate;
  return null;
}

export function isEventTimePassed(event: EventDoc, now = new Date()): boolean {
  return getNextEventOccurrence(event, now) === null;
}

export function isAfterEveningCutoff(now = new Date()): boolean {
  return now.getHours() * 60 + now.getMinutes() >= 22 * 60 + 30;
}

export function sortEventsForSuggestions(
  events: EventDoc[],
  now = new Date(),
): EventDoc[] {
  const ranked = events
    .map((event) => ({
      event,
      occurrence: getNextEventOccurrence(event, now),
    }))
    .filter(
      (row): row is { event: EventDoc; occurrence: Date } =>
        row.occurrence !== null,
    );

  ranked.sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime());

  if (isAfterEveningCutoff(now)) {
    return ranked.map((row) => row.event);
  }

  ranked.sort((a, b) => {
    const aDaily = isDailyCategory(a.event);
    const bDaily = isDailyCategory(b.event);
    if (aDaily !== bDaily) return aDaily ? 1 : -1;
    return a.occurrence.getTime() - b.occurrence.getTime();
  });

  return ranked.map((row) => row.event);
}
