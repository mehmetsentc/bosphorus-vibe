"use client";

import {
  IconDailyActivity,
  IconEveningShow,
} from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";

export type EventCategoryTab = "show" | "daily";

type EventCategoryTabsProps = {
  active: EventCategoryTab;
  onChange: (tab: EventCategoryTab) => void;
};

export function EventCategoryTabs({ active, onChange }: EventCategoryTabsProps) {
  const t = useT();

  const tabs: {
    id: EventCategoryTab;
    labelKey: "eveningShow" | "dailyActivities";
    icon: typeof IconEveningShow;
  }[] = [
    { id: "show", labelKey: "eveningShow", icon: IconEveningShow },
    { id: "daily", labelKey: "dailyActivities", icon: IconDailyActivity },
  ];

  return (
    <div className="mb-5 flex border-b border-border">
      {tabs.map(({ id, labelKey, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative flex flex-1 flex-col items-center gap-1.5 pb-3 pt-1 transition ${
              isActive ? "text-vibe" : "text-muted"
            }`}
          >
            <Icon size={22} />
            <span className="text-xs font-semibold">{t(labelKey)}</span>
            {isActive && (
              <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-vibe" />
            )}
          </button>
        );
      })}
    </div>
  );
}
