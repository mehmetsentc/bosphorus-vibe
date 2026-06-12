"use client";

import { useT } from "@/components/providers/I18nProvider";
import type { UploadKind } from "@/components/upload/CreateUploadFlow";

type UploadModeSwitcherProps = {
  active: UploadKind;
  onChange: (kind: UploadKind) => void;
};

const MODES: UploadKind[] = ["post", "story", "reel"];

export function UploadModeSwitcher({ active, onChange }: UploadModeSwitcherProps) {
  const t = useT();

  const labels: Record<UploadKind, string> = {
    post: t("uploadModePost"),
    story: t("uploadModeStory"),
    reel: t("uploadModeReels"),
  };

  return (
    <div className="flex items-center justify-center gap-5 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`text-[11px] font-semibold tracking-wide transition ${
            active === mode ? "text-white" : "text-white/45"
          }`}
        >
          {labels[mode]}
        </button>
      ))}
    </div>
  );
}
