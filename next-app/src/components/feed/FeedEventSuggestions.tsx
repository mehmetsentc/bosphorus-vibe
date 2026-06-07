"use client";

import Link from "next/link";
import {
  IconClock,
  IconDailyActivity,
  IconEveningShow,
  IconLocation,
} from "@/components/icons/Icons";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  formatEventListDate,
  getNextEventOccurrence,
  isSameCalendarDay,
} from "@/lib/utils/event-dates";
import { getDailyRepeatLabel } from "@/lib/utils/firestore-helpers";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { EventDoc } from "@/types";

type FeedEventSuggestionsProps = {
  events: EventDoc[];
};

function isDailyEvent(event: EventDoc): boolean {
  return event.eventCategory.trim().toLowerCase() === "daily";
}

function formatWhenLabel(
  event: EventDoc,
  locale: Parameters<typeof formatEventListDate>[1],
): string {
  const occurrence = getNextEventOccurrence(event);
  if (!occurrence) return event.eventTimeLabel;

  if (isDailyEvent(event)) {
    const today = new Date();
    if (isSameCalendarDay(occurrence, today)) {
      return `${getDailyRepeatLabel(locale)} · ${event.eventTimeLabel}`;
    }
    return `${formatEventListDate(occurrence, locale)} · ${event.eventTimeLabel}`;
  }

  return `${formatEventListDate(event.eventDate, locale)} · ${event.eventTimeLabel}`;
}

export function FeedEventSuggestions({ events }: FeedEventSuggestionsProps) {
  const t = useT();
  const { locale } = useI18n();

  const visible = events.filter((event) => getNextEventOccurrence(event) !== null);

  if (!visible.length) return null;

  return (
    <article className="border-b border-border bg-background py-4">
      <div className="mb-3 flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold">{t("feedSuggestEvents")}</h3>
        <Link href="/events" className="text-xs font-semibold text-gold">
          {t("seeAll")}
        </Link>
      </div>
      <div className="events-scroll px-3">
        <div className="flex gap-3 pb-1">
          {visible.map((event) => {
            const isShow =
              event.eventCategory.trim().toLowerCase() === "show time";
            const whenLabel = formatWhenLabel(event, locale);

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}?from=/home`}
                className="group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-card transition hover:border-gold/30 sm:w-[280px]"
              >
                <div className="relative flex h-[132px] w-full items-center justify-center bg-black px-3 py-2">
                  {event.eventImage ? (
                    <div className="relative h-full w-full">
                      <OptimizedImage
                        src={event.eventImage}
                        alt={event.eventName}
                        fill
                        sizes="280px"
                        className="object-contain object-center"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-gold/15 to-vibe/10">
                      {isShow ? (
                        <IconEveningShow size={36} className="text-gold/50" />
                      ) : (
                        <IconDailyActivity size={36} className="text-gold/50" />
                      )}
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-gold backdrop-blur-sm">
                    {isShow ? t("showTime") : t("sportsCategory")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-gold">
                    {event.eventName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <IconClock size={12} className="shrink-0 text-gold" />
                    <span className="truncate">{whenLabel}</span>
                  </div>
                  {event.eventLocation && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <IconLocation size={12} className="shrink-0 text-gold" />
                      <span className="truncate">{event.eventLocation}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}
