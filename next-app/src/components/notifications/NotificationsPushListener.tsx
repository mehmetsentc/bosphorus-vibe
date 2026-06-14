"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useT } from "@/components/providers/I18nProvider";
import {
  notificationHref,
  subscribeNotifications,
} from "@/lib/services/notifications";
import type { NotificationDoc, NotificationType } from "@/types";

function pushEnabledForType(
  type: string,
  prefs: {
    notifyLikes: boolean;
    notifyComments: boolean;
    notifyReposts: boolean;
    notifyMessages: boolean;
  },
): boolean {
  switch (type as NotificationType) {
    case "like":
      return prefs.notifyLikes;
    case "comment":
      return prefs.notifyComments;
    case "repost":
      return prefs.notifyReposts;
    case "message":
      return prefs.notifyMessages;
    default:
      return true;
  }
}

function formatPushBody(n: NotificationDoc, t: (key: string) => string): string {
  const name = n.actor_name ?? t("notificationSomeone");
  switch (n.type) {
    case "like":
      return t("notificationPushLike").replace("{name}", name);
    case "comment":
      return t("notificationPushComment").replace("{name}", name);
    case "repost":
      return t("notificationPushRepost").replace("{name}", name);
    case "message":
      return n.notification_text || t("notificationPushMessage").replace("{name}", name);
    default:
      return n.notification_text;
  }
}

/** Shows browser push when permission is granted and a new in-app notification arrives. */
export function NotificationsPushListener() {
  const { user } = useAuth();
  const { prefs } = useSettings();
  const t = useT();
  const seenRef = useRef<Set<string>>(new Set());
  const primedRef = useRef(false);

  useEffect(() => {
    if (!user?.uid || user.isAnonymous) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const unsub = subscribeNotifications(user.uid, (items) => {
      if (!primedRef.current) {
        for (const item of items) seenRef.current.add(item.id);
        primedRef.current = true;
        return;
      }

      for (const item of items) {
        if (seenRef.current.has(item.id)) continue;
        seenRef.current.add(item.id);
        if (item.is_read) continue;
        if (!pushEnabledForType(item.type, prefs)) continue;

        try {
          const notification = new Notification(t("notificationsTitle"), {
            body: formatPushBody(item, (key) => t(key as never)),
            icon: item.actor_photo || "/icon.png",
            tag: item.id,
          });
          notification.onclick = () => {
            window.focus();
            window.location.href = notificationHref(item);
            notification.close();
          };
        } catch {
          // ignore unsupported environments
        }
      }
    });

    return unsub;
  }, [user?.uid, user?.isAnonymous, prefs, t]);

  return null;
}
