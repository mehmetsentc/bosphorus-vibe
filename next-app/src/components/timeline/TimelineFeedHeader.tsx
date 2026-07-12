"use client";

import Link from "next/link";
import { IconPlus } from "@/components/icons/Icons";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useT } from "@/components/providers/I18nProvider";

export function TimelineFeedHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 -mx-3 mb-4 border-b border-border/80 bg-background/90 px-3 py-3 backdrop-blur-xl sm:-mx-4 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/upload"
          aria-label={t("createTitle")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-card transition hover:border-gold/40 hover:bg-surface-overlay"
        >
          <IconPlus size={20} />
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-lg font-semibold tracking-tight">
            {t("timelineTitle")}
          </p>
          <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {t("timelineLive")}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
