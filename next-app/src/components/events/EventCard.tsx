"use client";

import { motion } from "framer-motion";
import type { EventDoc } from "@/types";
import { formatDate } from "@/lib/utils/time";
import { getDailyRepeatLabel } from "@/lib/utils/firestore-helpers";
import { useI18n, useT } from "@/components/providers/I18nProvider";

export function EventCard({ event, index }: { event: EventDoc; index: number }) {
  const t = useT();
  const { locale } = useI18n();
  const isDaily = event.eventCategory.trim().toLowerCase() === "daily";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl border border-border bg-surface-card"
    >
      {event.eventImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.eventImage}
          alt={event.eventName}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gold">
              {event.eventCategory}
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold">
              {event.eventName}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-gold">{event.eventTimeLabel}</p>
            <p className="text-[10px] text-muted">
              {isDaily ? getDailyRepeatLabel(locale) : formatDate(event.eventDate)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">{event.eventLocation}</p>
        {event.eventDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-muted/80">
            {event.eventDescription}
          </p>
        )}
        <button
          type="button"
          className="mt-4 w-full rounded-xl gold-gradient py-2.5 text-sm font-bold text-black transition hover:opacity-90"
        >
          {t("join")}
        </button>
      </div>
    </motion.article>
  );
}
