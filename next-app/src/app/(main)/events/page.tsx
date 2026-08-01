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
  parseEventTimeMinutes,
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
  category: EventsCategory | "weekly";
};

type ActiveTab = "timeline" | "all";

function pickShowHighlight(showTimeEvents: EventDoc[]): EventDoc | null {
  const now = new Date();
  const today = startOfDay(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todaysShows = showTimeEvents
    .filter((e) => isSameCalendarDay(e.eventDate, today))
    .sort(
      (a, b) =>
        parseEventTimeMinutes(a.eventTimeLabel) -
        parseEventTimeMinutes(b.eventTimeLabel),
    );

  const upcoming =
    todaysShows.find((e) => parseEventTimeMinutes(e.eventTimeLabel) >= nowMinutes) ??
    null;

  return upcoming ?? todaysShows[todaysShows.length - 1] ?? showTimeEvents[0] ?? null;
}

function buildProgramList(
  dailyEvents: EventDoc[],
  showTimeEvents: EventDoc[],
  weeklyEvents: EventDoc[],
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

    // Weekly events — shown when a specific date filter matches the event's day-of-week
    // or always shown when no date filter (all)
    const selectedDow = selectedDate ? selectedDate.getDay() : null;
    for (const event of weeklyEvents) {
      const days = event.eventDays ?? [];
      if (selectedDow === null || days.includes(selectedDow)) {
        items.push({ event, category: "weekly" });
      }
    }
  }

  return items;
}

export default function EventsPage() {
  const { profile } = useAuth();
  const t = useT();
  const { dailyEvents, showTimeEvents, weeklyEvents, loading, refreshing, refresh } = useEvents();
  const [activeTab, setActiveTab] = useState<ActiveTab>("timeline");
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
    () => buildProgramList(dailyEvents, showTimeEvents, weeklyEvents, category, selectedDate),
    [dailyEvents, showTimeEvents, weeklyEvents, category, selectedDate],
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

            {/* ── Tab Switcher — timeline is the primary surface ── */}
            <div className="mt-6 flex gap-2 rounded-2xl border border-border/60 bg-surface-card/40 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("timeline");
                  setSelectedDate(null); // ← reset date when switching to today view
                }}
                className={`flex-[1.15] rounded-xl py-3 text-sm font-bold transition ${
                  activeTab === "timeline"
                    ? "gold-gradient text-black shadow-md shadow-gold/20"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                  activeTab === "all"
                    ? "gold-gradient text-black shadow-md shadow-gold/20"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Tüm Program
              </button>
            </div>

            {/* ── Date Strip — only visible in "all" tab ── */}
            {activeTab === "all" && (
              <div className="mt-4">
                <EventsDateStrip
                  dates={dateStrip}
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>
            )}

            {/* ── Tab Content ── */}
            {activeTab === "timeline" ? (
              /* Timeline Tab */
              <section className="mt-5">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-subtle">
                    Program
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-foreground">
                    Bugünün akışı
                  </h2>
                </div>
                {showTimeline && (dailyEvents.length > 0 || showTimeEvents.length > 0 || weeklyEvents.length > 0) ? (
                  <TodayTimeline
                    dailyEvents={dailyEvents}
                    showTimeEvents={showTimeEvents}
                    weeklyEvents={weeklyEvents}
                  />
                ) : (
                  <p className="py-12 text-center text-sm text-muted">
                    {t("noEventsInCategory")}
                  </p>
                )}
              </section>
            ) : (
              /* All Events Tab */
              <section className="mt-6">
                <EventsCategoryPicker active={category} onChange={setCategory} />

                <div className="mt-6">
                  {listSubheading && (
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-subtle">
                      {listSubheading}
                    </p>
                  )}
                  <h2 className="mb-4 text-lg font-bold">{listHeading}</h2>

                  {showSundayOff ? (
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-gold">
                        {t("sundayDayOff")}
                      </p>
                      <p className="mt-1 text-sm text-muted">{t("dailyRepeat")}</p>
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
                </div>
              </section>
            )}
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
