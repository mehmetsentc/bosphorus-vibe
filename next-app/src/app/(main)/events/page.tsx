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
import { TodayTimeline } from "@/components/events/TodayTimeline";
import { ActivityUploadModal } from "@/components/upload/ActivityUploadModal";
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
    const showSports = selectedDate === null || !isSunday(selectedDate);
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
  const { dailyEvents, showTimeEvents, loading, refreshing, refresh } = useEvents();
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

  // Show timeline only when no date filter or today selected
  const today = startOfDay(new Date());
  const showTimeline =
    selectedDate === null || isSameCalendarDay(selectedDate, today);

  return (
    <PageShell className="pb-10 pt-4">
      <PullToRefresh onRefresh={refresh} refreshing={refreshing}>
        <EventsPageHeader onRefresh={refresh} refreshing={refreshing} />

        {loading ? (
          <EventsPageSkeleton />
        ) : (
          <>
            {/* ── Hero Highlight ── */}
            {showHighlight && (
              <div className="mb-5">
                <EventsShowHighlight event={showHighlight} />
              </div>
            )}

            {/* ── Date Strip ── */}
            <EventsDateStrip
              dates={dateStrip}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />

            {/* ── Today's Timeline ── */}
            {showTimeline && (dailyEvents.length > 0 || showTimeEvents.length > 0) && (
              <section className="mt-7">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                        })
                      : "Bugünün Programı"}
                  </h2>
                  <span className="rounded-full bg-surface-overlay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Timeline
                  </span>
                </div>

                <TodayTimeline
                  dailyEvents={dailyEvents}
                  showTimeEvents={showTimeEvents}
                />
              </section>
            )}

            {/* ── Category Filter ── */}
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted">
                  {t("allEvents")}
                </h2>
              </div>
              <EventsCategoryPicker active={category} onChange={setCategory} />
            </section>

            {/* ── Full Event List ── */}
            <section className="mt-6">
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
