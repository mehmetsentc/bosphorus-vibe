"use client";

import { motion } from "framer-motion";
import type { EventDoc } from "@/types";
import { formatDate } from "@/lib/utils/time";

export function HighlightBanner({ event }: { event: EventDoc }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {event.eventImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.eventImage}
          alt={event.eventName}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="relative p-5 pt-32">
        <span className="inline-block rounded-full gold-gradient px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
          Highlight
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold">{event.eventName}</h2>
        <p className="mt-1 text-sm text-white/70">
          {event.eventTimeLabel} · {formatDate(event.eventDate)} · {event.eventLocation}
        </p>
        {event.eventDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-white/50">
            {event.eventDescription}
          </p>
        )}
      </div>
    </motion.div>
  );
}
