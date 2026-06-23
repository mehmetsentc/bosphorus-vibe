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
      className="relative block overflow-hidden rounded-3xl border border-gold/20 bg-surface-card transition active:scale-[0.99]"
      style={{ minHeight: 340 }}
    >
      {/* Full image */}
      {event.eventImage ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={event.eventImage}
            alt={event.eventName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 672px, 896px"
            className="object-cover object-center"
            priority
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/25 to-vibe/15" />
      )}

      {/* Gradient — lighter at top, heavier at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Countdown — top right, clearly visible */}
      {occurrence && (
        <div className="absolute right-4 top-4 z-10">
          <EventPosterCountdown target={occurrence} />
        </div>
      )}

      {/* Badge — top left */}
      <div className="absolute left-4 top-4 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full gold-gradient px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-lg">
          {t("showOfTheDay")}
        </span>
      </div>

      {/* Content — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="font-display text-2xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-3xl">
          {event.eventName}
        </h2>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">
            <IconClock size={15} className="text-gold" />
            {formatEventListDate(event.eventDate, locale)} · {event.eventTimeLabel}
          </span>
          {event.eventLocation && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">
              <IconLocation size={15} className="text-gold" />
              {event.eventLocation}
            </span>
          )}
        </div>

        {event.eventDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">
            {event.eventDescription}
          </p>
        )}

        {/* CTA hint */}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold">
          <span>Detayları Gör</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  );
}
