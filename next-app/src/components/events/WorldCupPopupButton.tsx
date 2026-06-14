"use client";

import { useMemo } from "react";
import { useT } from "@/components/providers/I18nProvider";
import { getActiveWorldCupPopup } from "@/lib/events/world-cup-popup";
import { useWorldCupPopupStore } from "@/store/worldCupPopupStore";

export function WorldCupPopupButton({ className = "" }: { className?: string }) {
  const t = useT();
  const requestOpen = useWorldCupPopupStore((s) => s.requestOpen);
  const active = useMemo(() => getActiveWorldCupPopup(), []);

  if (!active) return null;

  return (
    <button
      type="button"
      onClick={requestOpen}
      className={`inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20 ${className}`}
    >
      <span aria-hidden>⚽</span>
      {t("worldCupDailySummary")}
    </button>
  );
}
