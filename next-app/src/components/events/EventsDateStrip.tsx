"use client";

import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  formatDateStripDay,
  isSameCalendarDay,
  startOfDay,
} from "@/lib/utils/event-dates";

type EventsDateStripProps = {
  dates: Date[];
  selected: Date | null;
  onSelect: (date: Date | null) => void;
};

export function EventsDateStrip({
  dates,
  selected,
  onSelect,
}: EventsDateStripProps) {
  const { locale } = useI18n();
  const t = useT();

  return (
    <div className="events-scroll -mx-4 px-4">
      <div className="flex gap-2 pb-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex min-w-[52px] shrink-0 flex-col items-center justify-center rounded-2xl px-3 py-2.5 transition ${
            selected === null
              ? "gold-gradient text-black shadow-gold"
              : "bg-surface-overlay text-muted hover:text-foreground"
          }`}
        >
          <span className="text-[11px] font-bold uppercase leading-none">
            {t("allDates")}
          </span>
        </button>
        {dates.map((date) => {
          const active = selected !== null && isSameCalendarDay(date, selected);
          const dayNum = date.getDate();
          const dayName = formatDateStripDay(date, locale);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelect(startOfDay(date))}
              className={`flex min-w-[52px] shrink-0 flex-col items-center rounded-2xl px-3 py-2.5 transition ${
                active
                  ? "gold-gradient text-black shadow-gold"
                  : "bg-surface-overlay text-muted hover:text-foreground"
              }`}
            >
              <span className="text-lg font-bold leading-none">{dayNum}</span>
              <span className="mt-1 text-[10px] font-medium uppercase">
                {dayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
