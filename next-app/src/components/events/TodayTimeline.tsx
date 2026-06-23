"use client";

import { useMemo } from "react";
import Link from "next/link";
import { IconLocation } from "@/components/icons/Icons";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  parseEventTimeMinutes,
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
  weeklyEvents: EventDoc[],
  today: Date,
): TimelineEntry[] {
  const isSun = today.getDay() === 0;
  const todayDow = today.getDay(); // 0=Sun … 6=Sat
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

  // Weekly events — only on matching day of week
  for (const event of weeklyEvents) {
    const days = event.eventDays ?? [];
    if (days.includes(todayDow)) {
      entries.push({
        event,
        category: "show",
        timeMinutes: parseEventTimeMinutes(event.eventTimeLabel),
        timeLabel: event.eventTimeLabel,
      });
    }
  }

  entries.sort((a, b) => a.timeMinutes - b.timeMinutes);
  return entries;
}

function getNowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

type Props = {
  dailyEvents: EventDoc[];
  showTimeEvents: EventDoc[];
  weeklyEvents: EventDoc[];
  now?: Date;
};

export function TodayTimeline({ dailyEvents, showTimeEvents, weeklyEvents, now = new Date() }: Props) {
  const today = startOfDay(now);
  const nowMinutes = getNowMinutes(now);

  const entries = useMemo(
    () => buildTodayTimeline(dailyEvents, showTimeEvents, weeklyEvents, today),
    [dailyEvents, showTimeEvents, weeklyEvents, today],
  );

  const nextIndex = useMemo(() => {
    return entries.findIndex((e) => e.timeMinutes > nowMinutes);
  }, [entries, nowMinutes]);

  if (!entries.length) return null;

  return (
    <>
      <style>{`
        @keyframes timelineDraw {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        .timeline-line-animated {
          transform-origin: top center;
          animation: timelineDraw 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      <div className="relative">
        {/* Animated vertical line */}
        <div
          className="timeline-line-animated absolute bottom-0 top-0 z-0"
          style={{
            left: 60,
            width: 2,
            background:
              "linear-gradient(to bottom, rgba(234,179,8,0.7) 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.06) 100%)",
          }}
        />

        <div className="space-y-2">
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
    </>
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
      className={`relative flex items-start transition active:scale-[0.99] ${
        isPast && !isOngoing ? "opacity-55" : ""
      }`}
    >
      {/* Time column */}
      <div className="w-[60px] shrink-0 pt-4 pr-4 text-right">
        <span
          className={`text-xs font-bold tabular-nums leading-none ${
            isNext ? "text-gold" : isPast ? "text-muted-subtle" : "text-foreground"
          }`}
        >
          {entry.timeLabel}
        </span>
      </div>

      {/* Dot on the line */}
      <div className="relative z-10 shrink-0" style={{ width: 2 }}>
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full border-2 transition-all ${
            isNext
              ? "top-[13px] h-4 w-4 border-gold bg-gold shadow-[0_0_10px_3px_rgba(234,179,8,0.5)]"
              : isOngoing
                ? "top-[14px] h-3.5 w-3.5 border-vibe bg-vibe"
                : isPast
                  ? "top-[15px] h-2.5 w-2.5 border-white/20 bg-surface-card"
                  : "top-[15px] h-3 w-3 border-white/30 bg-surface-overlay"
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`ml-5 mb-2.5 flex-1 rounded-2xl border p-3.5 transition ${
          isNext
            ? "border-gold/50 bg-gold/5 shadow-md shadow-gold/10"
            : isOngoing
              ? "border-vibe/30 bg-vibe/5"
              : isPast
                ? "border-border/40 bg-surface-card/60"
                : "border-border bg-surface-card hover:border-gold/25"
        }`}
      >
        <div className="flex items-center gap-3.5">
          {/* Thumbnail — bigger */}
          {entry.event.eventImage && (
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
              <OptimizedImage
                src={entry.event.eventImage}
                alt={entry.event.eventName}
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-[15px] font-bold leading-snug ${
                  isPast && !isOngoing ? "text-muted" : "text-foreground"
                }`}
              >
                {entry.event.eventName}
              </h3>

              {/* Status badge */}
              {isNext && (
                <span className="shrink-0 rounded-full gold-gradient px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                  Sıradaki
                </span>
              )}
              {isOngoing && (
                <span className="shrink-0 rounded-full bg-vibe px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  Devam ediyor
                </span>
              )}
              {!isNext && !isOngoing && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    entry.category === "sports"
                      ? "bg-vibe/10 text-vibe"
                      : "bg-gold/10 text-gold"
                  }`}
                >
                  {entry.category === "sports" ? "Spor" : "Show"}
                </span>
              )}
            </div>

            {entry.event.eventLocation && (
              <div className="mt-1.5 flex items-center gap-1 text-sm text-muted">
                <IconLocation size={13} className="shrink-0 text-gold" />
                <span className="truncate">{entry.event.eventLocation}</span>
              </div>
            )}

            {entry.event.eventDescription && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-subtle">
                {entry.event.eventDescription}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
