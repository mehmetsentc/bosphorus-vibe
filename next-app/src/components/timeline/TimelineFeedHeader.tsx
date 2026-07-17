"use client";

import Link from "next/link";
import { IconPlus } from "@/components/icons/Icons";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useT } from "@/components/providers/I18nProvider";

export function TimelineFeedHeader() {
  const t = useT();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 px-3 py-2.5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/upload"
          aria-label={t("createTitle")}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-surface-overlay"
        >
          <IconPlus size={22} />
        </Link>

        <h1 className="font-display text-[17px] font-semibold tracking-tight">
          {t("timelineTitle")}
        </h1>

        <div className="flex h-9 w-9 items-center justify-center">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
