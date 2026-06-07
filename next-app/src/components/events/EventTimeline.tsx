"use client";

import { formatDate } from "@/lib/utils/time";
import type { EventDoc } from "@/types";
import { EventCard } from "./EventCard";
import { useT } from "@/components/providers/I18nProvider";

export function EventTimeline({
  events,
  groupByDate = true,
}: {
  events: EventDoc[];
  groupByDate?: boolean;
}) {
  const t = useT();

  if (!events.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted">
        {t("noEventsInCategory")}
      </p>
    );
  }

  if (!groupByDate) {
    return (
      <div className="space-y-4">
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    );
  }

  const grouped = events.reduce<Record<string, EventDoc[]>>((acc, event) => {
    const key = formatDate(event.eventDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const dates = Object.keys(grouped);

  return (
    <div className="space-y-8">
      {dates.map((date) => (
        <section key={date}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              {date}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-4">
            {grouped[date].map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
