"use client";

import Link from "next/link";
import { IconClock, IconLocation } from "@/components/icons/Icons";
import { EventPosterCountdown } from "@/components/events/EventPosterCountdown";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  formatEventListDate,
  getNextEventOccurrence,
} from "@/lib/utils/event-dates";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { EventDoc } from "@/types";

type EventsShowHighlightProps = {
  event: EventDoc;
};

export function EventsShowHighlight({ event }: EventsShowHighlightProps) {
  const t = useT();
  const { locale } = useI18n();
  const occurrence = getNextEventOccurrence(event);

  return (
    <Link
      href={`/events/${event.id}?from=/events`}
      className="relative block min-h-[240px] overflow-hidden rounded-2xl border border-gold/30 bg-surface-card transition hover:border-gold/50 active:scale-[0.99] sm:min-h-[280px]"
    >
      {event.eventImage ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={event.eventImage}
            alt={event.eventName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 672px, 896px"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/25 to-vibe/15" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

      {occurrence && (
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <EventPosterCountdown target={occurrence} />
        </div>
      )}

      <div className="relative p-4 pt-28 sm:p-5 sm:pt-32">
        <span className="inline-block rounded-full gold-gradient px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
          {t("showOfTheDay")}
        </span>
        <h2 className="mt-2 font-display text-xl font-bold leading-tight sm:text-2xl">
          {event.eventName}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={14} className="text-gold" />
            {formatEventListDate(event.eventDate, locale)} · {event.eventTimeLabel}
          </span>
          {event.eventLocation && (
            <span className="inline-flex items-center gap-1.5">
              <IconLocation size={14} className="text-gold" />
              {event.eventLocation}
            </span>
          )}
        </div>
        {event.eventDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-white/55">
            {event.eventDescription}
          </p>
        )}
      </div>
    </Link>
  );
}
