"use client";

import { motion } from "framer-motion";
import { useT } from "@/components/providers/I18nProvider";
import type { EventDoc } from "@/types";

export function TodayEventsList({ events }: { events: EventDoc[] }) {
  const t = useT();

  if (!events.length) {
    return (
      <p className="py-8 text-center text-sm text-white/40">
        {t("noEventsToday")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-xl bg-surface-raised p-3 border border-white/5"
        >
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-overlay">
            <span className="text-xs font-bold text-gold">{event.eventTimeLabel}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{event.eventName}</p>
            <p className="truncate text-xs text-white/40">{event.eventLocation}</p>
          </div>
          <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase text-gold">
            {event.eventCategory}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
