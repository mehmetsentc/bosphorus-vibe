"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import {
  markNotificationRead,
  subscribeNotifications,
} from "@/lib/services/notifications";
import type { NotificationDoc, NotificationType } from "@/types";

function isTypeEnabled(
  type: string,
  prefs: {
    notifyLikes: boolean;
    notifyComments: boolean;
    notifyReposts: boolean;
    notifyMessages: boolean;
    notifyFollows: boolean;
    notifyEvents: boolean;
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
    case "follow":
      return prefs.notifyFollows;
    default:
      return true;
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const { prefs } = useSettings();
  const [items, setItems] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid || user.isAnonymous) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeNotifications(
      user.uid,
      (next) => {
        setItems(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [user?.uid, user?.isAnonymous]);

  const visibleItems = useMemo(
    () => items.filter((n) => isTypeEnabled(n.type, prefs)),
    [items, prefs],
  );

  const unreadCount = useMemo(
    () => visibleItems.filter((n) => !n.is_read).length,
    [visibleItems],
  );

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await markNotificationRead(id).catch(() => {});
  }

  return {
    items: visibleItems,
    unreadCount,
    loading,
    error,
    markRead,
  };
}
