"use client";

import { useT } from "@/components/providers/I18nProvider";
import type { StoryCategory } from "@/types";

export type ProfileHighlightItem = {
  id: StoryCategory;
  label: string;
  cover?: string;
  emoji?: string;
  count: number;
};

type ProfileHighlightsProps = {
  items: ProfileHighlightItem[];
  activeId?: StoryCategory | null;
  onSelect?: (id: StoryCategory) => void;
  /** Own profile only — shown when there are no story highlights yet */
  onAddStory?: () => void;
};

export function ProfileHighlights({
  items,
  activeId,
  onSelect,
  onAddStory,
}: ProfileHighlightsProps) {
  const t = useT();
  const withStories = items.filter((item) => item.count > 0);

  if (withStories.length === 0) {
    if (!onAddStory) return null;

    return (
      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={onAddStory}
          className="flex w-[68px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-0.5 transition hover:opacity-90 active:scale-[0.98]"
        >
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-dashed border-vibe/60 bg-surface-overlay">
            <span className="text-2xl font-light leading-none text-vibe">+</span>
          </div>
          <span className="max-w-[68px] truncate text-xs text-foreground">
            {t("addStory")}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 scrollbar-hide">
      <div className="flex gap-4">
        {withStories.map((item) => {
          const active = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={`flex w-[68px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-0.5 transition ${
                active ? "ring-1 ring-vibe/70" : ""
              }`}
            >
              <div className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border border-border bg-surface-overlay p-0.5">
                {item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{item.emoji || "✨"}</span>
                )}
                {item.count > 1 && (
                  <span className="absolute bottom-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-vibe px-1 text-[9px] font-bold text-black">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                )}
              </div>
              <span className="max-w-[68px] truncate text-xs text-foreground">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
