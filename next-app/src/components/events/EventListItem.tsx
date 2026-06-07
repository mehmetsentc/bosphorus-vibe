"use client";

import {
  IconClock,
  IconEventBadge,
  IconLocation,
} from "@/components/icons/Icons";
import {
  formatEventSchedule,
  getDailyRepeatLabel,
} from "@/lib/utils/firestore-helpers";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import type { EventDoc } from "@/types";

type EventListItemProps = {
  event: EventDoc;
  isDaily?: boolean;
  showTomorrowLabel?: boolean;
  canUpload?: boolean;
  onUpload?: () => void;
};

export function EventListItem({
  event,
  isDaily = false,
  showTomorrowLabel = false,
  canUpload = false,
  onUpload,
}: EventListItemProps) {
  const t = useT();
  const { locale } = useI18n();
  const timeLine = isDaily
    ? event.eventTimeLabel
    : formatEventSchedule(event.eventDate, event.eventTimeLabel);

  return (
    <article className="flex gap-3 border-b border-border py-3 last:border-b-0 md:rounded-xl md:border md:border-border md:bg-surface-card md:p-3 md:last:border-b md:border-b-border">
      <div className="h-[108px] w-[84px] shrink-0 overflow-hidden rounded-md bg-surface-overlay">
        {event.eventImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.eventImage}
            alt={event.eventName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gold/20 to-vibe/10 px-2 text-center text-[10px] font-bold uppercase text-muted">
            {event.eventName.slice(0, 20)}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
        <div className="flex items-start gap-2">
          <IconEventBadge size={16} className="mt-0.5 shrink-0 text-muted" />
          <p className="flex-1 text-xs font-bold uppercase leading-snug tracking-wide">
            {event.eventName}
          </p>
          {canUpload && (
            <button
              type="button"
              onClick={onUpload}
              className="shrink-0 rounded-lg border border-vibe/40 bg-vibe/10 px-2.5 py-1 text-[10px] font-bold uppercase text-vibe transition hover:bg-vibe/20"
            >
              {t("upload")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <IconClock size={15} className="shrink-0" />
          <span>{timeLine}</span>
          {isDaily && !showTomorrowLabel && (
            <span className="truncate text-[10px]">· {getDailyRepeatLabel(locale)}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <IconLocation size={15} className="shrink-0" />
          <span className="truncate uppercase">{event.eventLocation}</span>
        </div>
      </div>
    </article>
  );
}
