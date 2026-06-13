"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { EventsPageHeader } from "@/components/events/EventsPageHeader";
import { EventsDateStrip } from "@/components/events/EventsDateStrip";
import {
  EventsCategoryPicker,
  type EventsCategory,
} from "@/components/events/EventsCategoryPicker";
import { EventsPopularCard } from "@/components/events/EventsPopularCard";
import { EventsShowHighlight } from "@/components/events/EventsShowHighlight";
import { ActivityUploadModal } from "@/components/upload/ActivityUploadModal";
import { WorldCupDailyPopup } from "@/components/events/WorldCupDailyPopup";
import { isSunday } from "@/lib/utils/firestore-helpers";
import {
  getDateStrip,
  isSameCalendarDay,
  startOfDay,
} from "@/lib/utils/event-dates";
import { isAnimationTeamRole } from "@/lib/utils/roles";
import { EventsPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { PageShell } from "@/components/layout/PageShell";
import { useEvents } from "@/lib/hooks/useEvents";
import { useT } from "@/components/providers/I18nProvider";
import type { EventDoc } from "@/types";

type ListedEvent = {
  event: EventDoc;
  category: EventsCategory;
};

function pickShowHighlight(showTimeEvents: EventDoc[]): EventDoc | null {
  const today = startOfDay(new Date());
  const todaysShows = showTimeEvents.filter((e) =>
    isSameCalendarDay(e.eventDate, today),
  );
  return todaysShows[0] ?? showTimeEvents[0] ?? null;
}

function buildProgramList(
  dailyEvents: EventDoc[],
  showTimeEvents: EventDoc[],
  category: EventsCategory | null,
  selectedDate: Date | null,
): ListedEvent[] {
  const items: ListedEvent[] = [];
  const includeSports = category === null || category === "sports";
  const includeShow = category === null || category === "show";

  if (includeSports) {
    const showSports =
      selectedDate === null || !isSunday(selectedDate);
    if (showSports) {
      for (const event of dailyEvents) {
        items.push({ event, category: "sports" });
      }
    }
  }

  if (includeShow) {
    const shows =
      selectedDate === null
        ? showTimeEvents
        : showTimeEvents.filter((e) =>
            isSameCalendarDay(e.eventDate, selectedDate),
          );
    for (const event of shows) {
      items.push({ event, category: "show" });
    }
  }

  return items;
}

export default function EventsPage() {
  const { profile } = useAuth();
  const t = useT();
  const {
    dailyEvents,
    showTimeEvents,
    loading,
    refreshing,
    refresh,
  } = useEvents();
  const [category, setCategory] = useState<EventsCategory | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [uploadEvent, setUploadEvent] = useState<EventDoc | null>(null);
  const canUpload = isAnimationTeamRole(profile?.role);

  const dateStrip = useMemo(() => getDateStrip(new Date(), 14), []);

  const showHighlight = useMemo(
    () => pickShowHighlight(showTimeEvents),
    [showTimeEvents],
  );

  const listedEvents = useMemo(
    () => buildProgramList(dailyEvents, showTimeEvents, category, selectedDate),
    [dailyEvents, showTimeEvents, category, selectedDate],
  );

  const listHeading = useMemo(() => {
    if (category === "show") return t("eveningShows");
    if (category === "sports") return t("sportsActivities");
    return t("allEvents");
  }, [category, t]);

  const listSubheading =
    category === "sports" ? t("daytimeEvents") : null;

  const showSundayOff =
    selectedDate !== null &&
    isSunday(selectedDate) &&
    (category === null || category === "sports") &&
    !listedEvents.length;

  return (
    <PageShell className="pb-8 pt-4">
      <WorldCupDailyPopup />
      <PullToRefresh onRefresh={refresh} refreshing={refreshing}>
        <EventsPageHeader onRefresh={refresh} refreshing={refreshing} />

        {loading ? (
          <EventsPageSkeleton />
        ) : (
        <>
          {showHighlight && (
            <div className="mb-5">
              <EventsShowHighlight event={showHighlight} />
            </div>
          )}

          <EventsDateStrip
            dates={dateStrip}
            selected={selectedDate}
            onSelect={setSelectedDate}
          />

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-muted">
              {t("allEvents")}
            </h2>
            <EventsCategoryPicker active={category} onChange={setCategory} />
          </section>

          <section className="mt-8">
            {listSubheading && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
                {listSubheading}
              </p>
            )}
            <h2 className="mb-4 text-lg font-bold">{listHeading}</h2>

            {showSundayOff ? (
              <div className="rounded-2xl border border-gold/20 bg-gold/5 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-gold">
                  {t("sundayDayOff")}
                </p>
                <p className="mt-1 text-xs text-muted">{t("dailyRepeat")}</p>
              </div>
            ) : !listedEvents.length ? (
              <p className="py-12 text-center text-sm text-muted">
                {t("noEventsInCategory")}
              </p>
            ) : (
              <div className="space-y-3">
                {listedEvents.map(({ event, category: itemCategory }) => (
                  <EventsPopularCard
                    key={`${itemCategory}-${event.id}`}
                    event={event}
                    category={itemCategory}
                    eventDate={selectedDate}
                    canUpload={canUpload}
                    onUpload={() => setUploadEvent(event)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ActivityUploadModal
        open={Boolean(uploadEvent)}
        event={uploadEvent}
        onClose={() => setUploadEvent(null)}
        onSuccess={() => setUploadEvent(null)}
      />
      </PullToRefresh>
    </PageShell>
  );
}
