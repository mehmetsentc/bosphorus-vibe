"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  markAllNotificationsRead,
  notificationHref,
} from "@/lib/services/notifications";
import { useNotifications } from "@/lib/hooks/useNotifications";
import type { NotificationDoc } from "@/types";

function relativeTime(date: Date, locale: string): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

function notificationLabel(n: NotificationDoc, t: (key: string) => string): string {
  const name = n.actor_name ?? t("notificationSomeone");
  switch (n.type) {
    case "like":
      return t("notificationLike").replace("{name}", name);
    case "comment":
      return t("notificationComment").replace("{name}", name);
    case "repost":
      return t("notificationRepost").replace("{name}", name);
    case "message":
      return t("notificationMessage").replace("{name}", name);
    default:
      return n.notification_text;
  }
}

export function NotificationList() {
  const t = useT();
  const { dateLocale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, error, markRead } = useNotifications();

  async function handleOpen(n: NotificationDoc) {
    if (!n.is_read) await markRead(n.id);
    router.push(notificationHref(n));
  }

  async function handleMarkAll() {
    if (!user?.uid) return;
    await markAllNotificationsRead(user.uid);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-sm text-muted">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center text-sm text-muted">
        {t("notificationsLoadFailed")}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium">{t("notificationsEmptyTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("notificationsEmptyDesc")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={() => void handleMarkAll()}
          className="text-xs font-semibold text-accent"
        >
          {t("notificationsMarkAllRead")}
        </button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => void handleOpen(n)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface-overlay ${
                n.is_read ? "opacity-80" : "bg-surface-overlay/40"
              }`}
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-card">
                {n.actor_photo ? (
                  <OptimizedImage
                    src={n.actor_photo}
                    alt=""
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted">
                    {(n.actor_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                {!n.is_read ? (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  {notificationLabel(n, (key) => t(key as never))}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {relativeTime(n.time, dateLocale)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="px-4 py-6 text-center text-xs text-muted">
        <Link href="/profile/settings/notifications" className="text-accent">
          {t("notificationsManage")}
        </Link>
      </p>
    </div>
  );
}
