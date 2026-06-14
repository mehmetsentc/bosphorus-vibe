"use client";

import Link from "next/link";
import { IconHeart } from "@/components/icons/Icons";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useT } from "@/components/providers/I18nProvider";

export function NotificationBell({ className = "" }: { className?: string }) {
  const t = useT();
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/notifications"
      aria-label={t("notificationsTitle")}
      className={`relative rounded-lg p-1.5 transition hover:bg-surface-overlay ${className}`}
    >
      <IconHeart size={24} filled={unreadCount > 0} />
      {unreadCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
