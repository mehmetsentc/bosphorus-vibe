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

const DAY_MINUTES = 24 * 60;
/** Overnight spillover past midnight — cap so "until close" doesn't linger all day */
const MAX_OVERNIGHT_MINUTES = 8 * 60;

type TimelineEntry = {
  event: EventDoc;
  category: "sports" | "show";
  timeMinutes: number;
  timeLabel: string;
  /** Absolute end (minutes from midnight); set for capped overnight overflow */
  endMinutes?: number;
};

/** Varsayılan aktivite süresi (dk) — üstüne yazılabilir */
export const ACTIVITY_DURATION_MINUTES = 30;

export function eventDuration(event: EventDoc): number {
  return event.eventDurationMinutes ?? ACTIVITY_DURATION_MINUTES;
}

function entryEndMinutes(entry: TimelineEntry): number {
  return entry.endMinutes ?? entry.timeMinutes + eventDuration(entry.event);
}

function buildTodayTimeline(
  dailyEvents: EventDoc[],
  showTimeEvents: EventDoc[],
  weeklyEvents: EventDoc[],
  today: Date,
  nowMinutes: number,
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
        category: event.isSport ? "sports" : "show",
        timeMinutes: parseEventTimeMinutes(event.eventTimeLabel),
        timeLabel: event.eventTimeLabel,
      });
    }
  }

  // Gece yarısını geçen etkinlikler — dünden hâlâ devam edenler
  // Örn: 23:30'da başlayan, 150dk süren etkinlik → sabah 02:00'ya kadar görünür
  // "Until close" gibi aşırı süreler için spillover max 8 saat
  const yesterdayDow = (todayDow + 6) % 7;
  for (const event of weeklyEvents) {
    const days = event.eventDays ?? [];
    const duration = eventDuration(event);
    const startMin = parseEventTimeMinutes(event.eventTimeLabel);
    const endMin = startMin + duration;

    if (days.includes(yesterdayDow) && endMin > DAY_MINUTES) {
      const spillover = endMin - DAY_MINUTES;
      const overflowEnd = Math.min(spillover, Math.min(duration, MAX_OVERNIGHT_MINUTES));
      if (nowMinutes < overflowEnd) {
        entries.push({
          event,
          category: event.isSport ? "sports" : "show",
          timeMinutes: startMin - DAY_MINUTES, // negatif → sıralamada en üste
          timeLabel: event.eventTimeLabel,
          endMinutes: overflowEnd,
        });
      }
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
    () => buildTodayTimeline(dailyEvents, showTimeEvents, weeklyEvents, today, nowMinutes),
    [dailyEvents, showTimeEvents, weeklyEvents, today, nowMinutes],
  );

  // Biten aktiviteleri gizle (başlangıç + süre geçti ise)
  const visibleEntries = useMemo(
    () => entries.filter((e) => entryEndMinutes(e) > nowMinutes),
    [entries, nowMinutes],
  );

  const { ongoing, upNext, laterToday } = useMemo(() => {
    const ongoingList: TimelineEntry[] = [];
    const upcoming: TimelineEntry[] = [];

    for (const entry of visibleEntries) {
      const endMinutes = entryEndMinutes(entry);
      const isOngoing =
        entry.timeMinutes <= nowMinutes && endMinutes > nowMinutes;

      if (isOngoing) {
        ongoingList.push(entry);
      } else if (entry.timeMinutes > nowMinutes) {
        upcoming.push(entry);
      }
    }

    return {
      ongoing: ongoingList,
      upNext: upcoming.slice(0, 3),
      laterToday: upcoming.slice(3),
    };
  }, [visibleEntries, nowMinutes]);

  if (!visibleEntries.length) return null;

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

        <div className="space-y-4">
          {ongoing.length > 0 && (
            <TimelineSection title="Devam ediyor">
              {ongoing.map((entry, i) => (
                <TimelineRow
                  key={`ongoing-${entry.event.id}-${i}`}
                  entry={entry}
                  isPast={false}
                  isNext={false}
                  isOngoing
                />
              ))}
            </TimelineSection>
          )}

          {upNext.length > 0 && (
            <TimelineSection title="Sırada">
              {upNext.map((entry, i) => (
                <TimelineRow
                  key={`next-${entry.event.id}-${i}`}
                  entry={entry}
                  isPast={false}
                  isNext={i === 0}
                  isOngoing={false}
                />
              ))}
            </TimelineSection>
          )}

          {laterToday.length > 0 && (
            <TimelineSection title="Bugün">
              {laterToday.map((entry, i) => (
                <TimelineRow
                  key={`later-${entry.event.id}-${i}`}
                  entry={entry}
                  isPast={false}
                  isNext={false}
                  isOngoing={false}
                />
              ))}
            </TimelineSection>
          )}
        </div>
      </div>
    </>
  );
}

function TimelineSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="sticky top-0 z-20 -mx-1 mb-1.5 bg-background/90 px-1 py-1.5 backdrop-blur-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-subtle">
          {title}
        </p>
      </div>
      <div className="space-y-1.5">{children}</div>
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
      className={`relative flex items-start transition active:scale-[0.99] ${
        isPast && !isOngoing ? "opacity-55" : ""
      }`}
    >
      {/* Time column */}
      <div className="w-[60px] shrink-0 pt-3.5 pr-4 text-right">
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
              ? "top-[12px] h-4 w-4 border-gold bg-gold shadow-[0_0_10px_3px_rgba(234,179,8,0.5)]"
              : isOngoing
                ? "top-[13px] h-3.5 w-3.5 border-vibe bg-vibe"
                : isPast
                  ? "top-[14px] h-2.5 w-2.5 border-white/20 bg-surface-card"
                  : "top-[14px] h-3 w-3 border-white/30 bg-surface-overlay"
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`ml-5 mb-1.5 flex-1 rounded-2xl border p-3 transition ${
          isNext
            ? "border-gold/50 bg-gold/5 shadow-md shadow-gold/10"
            : isOngoing
              ? "border-vibe/30 bg-vibe/5"
              : isPast
                ? "border-border/40 bg-surface-card/60"
                : "border-border bg-surface-card hover:border-gold/25"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {entry.event.eventImage && (
            <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl">
              <OptimizedImage
                src={entry.event.eventImage}
                alt={entry.event.eventName}
                fill
                sizes="68px"
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
              <div className="mt-1 flex items-center gap-1 text-sm text-muted">
                <IconLocation size={13} className="shrink-0 text-gold" />
                <span className="truncate">{entry.event.eventLocation}</span>
              </div>
            )}

            {entry.event.durationLabel && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-subtle">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
                {entry.event.durationLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
