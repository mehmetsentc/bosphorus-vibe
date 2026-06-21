"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconClock, IconLocation } from "@/components/icons/Icons";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  parseEventTimeMinutes,
  getEventOccurrenceOnDay,
  isSameCalendarDay,
  startOfDay,
} from "@/lib/utils/event-dates";
import type { EventDoc } from "@/types";

type TimelineEntry = {
  event: EventDoc;
  category: "sports" | "show";
  timeMinutes: number;
  timeLabel: string;
};

function buildTodayTimeline(
  dailyEvents: EventDoc[],
  showTimeEvents: EventDoc[],
  today: Date,
): TimelineEntry[] {
  const isSun = today.getDay() === 0;
  const entries: TimelineEntry[] = [];

  // Sports (daily) — skip Sundays
  if (!isSun) {
    for (const event of dailyEvents) {
      entries.push({
        event,
        category: "sports",
        timeMinutes: parseEventTimeMinutes(event.eventTimeLabel),
        timeLabel: event.eventTimeLabel,
      });
    }
  }

  // Shows for today
  for (const event of showTimeEvents) {
    if (isSameCalendarDay(event.eventDate, today)) {
      entries.push({
        event,
        category: "show",
        timeMinutes: parseEventTimeMinutes(event.eventTimeLabel),
        timeLabel: event.eventTimeLabel,
      });
    }
  }

  // Sort by time
  entries.sort((a, b) => a.timeMinutes - b.timeMinutes);
  return entries;
}

function getNowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

type Props = {
  dailyEvents: EventDoc[];
  showTimeEvents: EventDoc[];
  now?: Date;
};

export function TodayTimeline({ dailyEvents, showTimeEvents, now = new Date() }: Props) {
  const today = startOfDay(now);
  const nowMinutes = getNowMinutes(now);

  const entries = useMemo(
    () => buildTodayTimeline(dailyEvents, showTimeEvents, today),
    [dailyEvents, showTimeEvents, today],
  );

  // Find index of the next event
  const nextIndex = useMemo(() => {
    return entries.findIndex((e) => e.timeMinutes > nowMinutes);
  }, [entries, nowMinutes]);

  if (!entries.length) return null;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {entries.map((entry, i) => {
          const isPast = entry.timeMinutes < nowMinutes;
          const isNext = i === nextIndex;
          const isOngoing =
            nextIndex > 0 && i === nextIndex - 1 && entry.timeMinutes <= nowMinutes;

          return (
            <TimelineRow
              key={`${entry.event.id}-${i}`}
              entry={entry}
              isPast={isPast}
              isNext={isNext}
              isOngoing={isOngoing}
            />
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({
  entry,
  isPast,
  isNext,
  isOngoing,
}: {
  entry: TimelineEntry;
  isPast: boolean;
  isNext: boolean;
  isOngoing: boolean;
}) {
  return (
    <Link
      href={`/events/${entry.event.id}?from=/events`}
      className={`relative flex items-start gap-0 transition active:scale-[0.99] ${
        isPast && !isOngoing ? "opacity-40" : ""
      }`}
    >
      {/* Time column */}
      <div className="w-[52px] shrink-0 pt-3 text-right pr-4">
        <span
          className={`text-[11px] font-bold tabular-nums leading-none ${
            isNext ? "text-gold" : isPast ? "text-muted" : "text-foreground/70"
          }`}
        >
          {entry.timeLabel}
        </span>
      </div>

      {/* Dot on the line */}
      <div className="relative shrink-0 flex flex-col items-center" style={{ width: 1 }}>
        <div
          className={`absolute top-[14px] -translate-x-1/2 rounded-full border-2 transition-all ${
            isNext
              ? "h-3.5 w-3.5 border-gold bg-gold shadow-gold"
              : isOngoing
                ? "h-3 w-3 border-vibe bg-vibe"
                : isPast
                  ? "h-2 w-2 border-border bg-surface-card"
                  : "h-2.5 w-2.5 border-border bg-surface-overlay"
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`ml-4 mb-2 flex-1 rounded-2xl border p-3 transition ${
          isNext
            ? "border-gold/40 bg-gold/5 shadow-sm shadow-gold/10"
            : isOngoing
              ? "border-vibe/30 bg-vibe/5"
              : isPast
                ? "border-border/50 bg-surface-card/60"
                : "border-border bg-surface-card hover:border-gold/20"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {entry.event.eventImage && (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <OptimizedImage
                src={entry.event.eventImage}
                alt={entry.event.eventName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-sm font-bold leading-snug ${
                  isPast && !isOngoing ? "text-muted" : "text-foreground"
                }`}
              >
                {entry.event.eventName}
              </h3>

              {/* Status badge */}
              {isNext && (
                <span className="shrink-0 rounded-full gold-gradient px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                  Sıradaki
                </span>
              )}
              {isOngoing && (
                <span className="shrink-0 rounded-full bg-vibe px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  Devam ediyor
                </span>
              )}
              {entry.category === "sports" && !isNext && !isOngoing && (
                <span className="shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 text-[9px] font-semibold uppercase text-muted">
                  Spor
                </span>
              )}
              {entry.category === "show" && !isNext && !isOngoing && (
                <span className="shrink-0 rounded-full bg-surface-overlay px-2 py-0.5 text-[9px] font-semibold uppercase text-muted">
                  Show
                </span>
              )}
            </div>

            {entry.event.eventLocation && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                <IconLocation size={11} className="text-gold/70" />
                <span className="truncate">{entry.event.eventLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
