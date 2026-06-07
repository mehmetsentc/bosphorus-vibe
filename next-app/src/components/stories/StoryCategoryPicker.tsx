"use client";

import { PROFILE_STORY_EMOJIS } from "@/lib/utils/story-categories";
import type { StoryCategory } from "@/types";

type StoryCategoryPickerProps = {
  value: StoryCategory;
  onChange: (category: StoryCategory) => void;
  labels: Record<StoryCategory, string>;
  disabled?: boolean;
  className?: string;
};

const ORDER: StoryCategory[] = ["vibe", "reels", "events"];

export function StoryCategoryPicker({
  value,
  onChange,
  labels,
  disabled,
  className = "",
}: StoryCategoryPickerProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {ORDER.map((id) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2 transition disabled:opacity-50 ${
              active
                ? "border-vibe bg-vibe/15 text-white"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{PROFILE_STORY_EMOJIS[id]}</span>
            <span className="w-full truncate text-[10px] font-semibold">
              {labels[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
