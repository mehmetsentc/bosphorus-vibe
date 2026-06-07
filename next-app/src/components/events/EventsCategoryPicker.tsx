"use client";

import {
  IconDailyActivity,
  IconEveningShow,
} from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";

export type EventsCategory = "show" | "sports";

type EventsCategoryPickerProps = {
  active: EventsCategory | null;
  onChange: (cat: EventsCategory | null) => void;
};

const categories: {
  id: EventsCategory;
  labelKey: "showTime" | "sportsCategory";
  icon: typeof IconEveningShow;
}[] = [
  { id: "show", labelKey: "showTime", icon: IconEveningShow },
  { id: "sports", labelKey: "sportsCategory", icon: IconDailyActivity },
];

export function EventsCategoryPicker({
  active,
  onChange,
}: EventsCategoryPickerProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map(({ id, labelKey, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(isActive ? null : id)}
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border px-4 py-6 transition ${
              isActive
                ? "border-gold/50 bg-gold/10 shadow-gold"
                : "border-border bg-surface-card hover:border-gold/30"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                isActive ? "gold-gradient text-black" : "bg-surface-overlay"
              }`}
            >
              <Icon size={28} />
            </div>
            <span
              className={`text-sm font-semibold ${
                isActive ? "text-gold" : "text-foreground"
              }`}
            >
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
