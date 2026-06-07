"use client";

import { motion } from "framer-motion";
import { EventTimeline } from "@/components/events/EventTimeline";
import type { EventDoc } from "@/types";

type EventSectionProps = {
  title: string;
  subtitle: string;
  events: EventDoc[];
  groupByDate?: boolean;
  accent?: "gold" | "vibe";
  index?: number;
  notice?: string;
};

export function EventSection({
  title,
  subtitle,
  events,
  groupByDate = true,
  accent = "gold",
  index = 0,
  notice,
}: EventSectionProps) {
  const accentClass = accent === "vibe" ? "text-vibe" : "text-gold";
  const barClass = accent === "vibe" ? "bg-vibe" : "gold-gradient";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="mb-10"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full ${barClass}`} />
        <div>
          <h2 className={`font-display text-lg font-bold ${accentClass}`}>
            {title}
          </h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <span className="ml-auto rounded-full border border-border bg-surface-card px-2.5 py-0.5 text-[10px] font-medium text-muted">
          {events.length}
        </span>
      </div>
      {notice && (
        <p className="mb-4 rounded-xl border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-gold">
          {notice}
        </p>
      )}
      <EventTimeline events={events} groupByDate={groupByDate} />
    </motion.section>
  );
}
