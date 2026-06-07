"use client";

import Link from "next/link";
import {
  IconClock,
  IconLocation,
} from "@/components/icons/Icons";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  formatEventListDate,
  formatEventTimeForDate,
} from "@/lib/utils/event-dates";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { EventDoc } from "@/types";

type EventsPopularCardProps = {
  event: EventDoc;
  category: "show" | "sports";
  eventDate?: Date | null;
  canUpload?: boolean;
  onUpload?: () => void;
};

export function EventsPopularCard({
  event,
  category,
  eventDate,
  canUpload = false,
  onUpload,
}: EventsPopularCardProps) {
  const t = useT();
  const { locale } = useI18n();

  const dateLine =
    category === "sports"
      ? eventDate
        ? formatEventTimeForDate(event.eventTimeLabel, eventDate, locale)
        : `${t("dailyRepeat")} · ${event.eventTimeLabel}`
      : `${formatEventListDate(event.eventDate, locale)} · ${event.eventTimeLabel}`;

  return (
    <Link
      href={`/events/${event.id}?from=/events`}
      className="flex gap-4 rounded-2xl border border-border bg-surface-card p-3 transition hover:border-gold/25"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-snug sm:text-base">
            {event.eventName}
          </h3>
          {canUpload && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpload?.();
              }}
              className="shrink-0 rounded-lg border border-vibe/40 bg-vibe/10 px-2 py-1 text-[10px] font-bold uppercase text-vibe"
            >
              {t("eventPostMedia")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <IconClock size={14} className="shrink-0 text-gold" />
          <span>{dateLine}</span>
        </div>

        {event.eventLocation && (
          <div className="flex items-start gap-2 text-xs text-muted">
            <IconLocation size={14} className="mt-0.5 shrink-0 text-gold" />
            <span className="line-clamp-2">{event.eventLocation}</span>
          </div>
        )}
      </div>

      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-surface-overlay sm:h-[96px] sm:w-[96px]">
        {event.eventImage ? (
          <OptimizedImage
            src={event.eventImage}
            alt={event.eventName}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gold/20 to-vibe/10 p-2 text-center text-[10px] font-bold uppercase text-muted">
            {event.eventName.slice(0, 16)}
          </div>
        )}
      </div>
    </Link>
  );
}
