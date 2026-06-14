"use client";

import Link from "next/link";
import { IconPlus } from "@/components/icons/Icons";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useT } from "@/components/providers/I18nProvider";

export function IgFeedHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur-md">
      <Link
        href="/upload"
        aria-label={t("createTitle")}
        className="rounded-lg p-1.5 transition hover:bg-surface-overlay"
      >
        <IconPlus size={24} />
      </Link>
      <button
        type="button"
        className="flex items-center gap-1 font-display text-base font-semibold"
      >
        {t("feedForYou")}
        <span className="text-xs text-muted">▾</span>
      </button>
      <NotificationBell />
    </header>
  );
}
