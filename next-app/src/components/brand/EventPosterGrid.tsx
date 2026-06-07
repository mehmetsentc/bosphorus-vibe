"use client";

import Link from "next/link";
import type { EventDoc } from "@/types";
import { useT } from "@/components/providers/I18nProvider";

type EventPosterGridProps = {
  events: EventDoc[];
};

export function EventPosterGrid({ events }: EventPosterGridProps) {
  const t = useT();
  const withImages = events.filter((e) => e.eventImage);

  if (!withImages.length) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        {t("noEventsInCategory")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-px bg-border">
      {withImages.map((event) => (
        <Link
          key={event.id}
          href="/events"
          title={event.eventName}
          className="relative block aspect-square overflow-hidden bg-background"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.eventImage}
            alt={event.eventName}
            loading="lazy"
            className="h-full w-full object-cover transition hover:opacity-90"
          />
        </Link>
      ))}
    </div>
  );
}
