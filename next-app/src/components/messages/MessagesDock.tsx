"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { IconMessage } from "@/components/icons/Icons";
import { ChatListItem } from "@/components/messages/ChatListItem";
import { MESSAGES_DOCK_DEFER_MS } from "@/lib/performance/app-state";
import {
  enrichChatPreviews,
  subscribeChats,
  type ChatPreview,
} from "@/lib/services/messages";
import { isImmersiveVideoRoute } from "@/lib/utils/immersive-routes";

export function MessagesDock() {
  const t = useT();
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [subscribeReady, setSubscribeReady] = useState(false);

  const hidden =
    pathname.startsWith("/messages") ||
    isImmersiveVideoRoute(pathname) ||
    pathname.startsWith("/welcome");

  useEffect(() => {
    if (open) setSubscribeReady(true);
  }, [open]);

  useEffect(() => {
    if (!user || hidden || subscribeReady) return;
    const id = window.setTimeout(() => setSubscribeReady(true), MESSAGES_DOCK_DEFER_MS);
    return () => window.clearTimeout(id);
  }, [user, hidden, subscribeReady]);

  useEffect(() => {
    if (!user || hidden || !subscribeReady) return;
    const unsub = subscribeChats(user.uid, async (raw) => {
      const enriched = await enrichChatPreviews(raw, user.uid);
      setChats(enriched.slice(0, 5));
    });
    return unsub;
  }, [user, hidden, subscribeReady]);

  const unreadCount = useMemo(
    () => chats.filter((c) => c.unread).length,
    [chats],
  );

  const recentAvatars = useMemo(
    () =>
      chats
        .filter((c) => c.otherUserPhoto)
        .slice(0, 3)
        .map((c) => c.otherUserPhoto!),
    [chats],
  );

  if (hidden || !user) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-8">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-semibold">{t("navMessages")}</h2>
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-gold hover:brightness-110"
            >
              {t("seeAll")}
            </Link>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {chats.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                {t("messagesEmptyDesc")}
              </p>
            ) : (
              chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  href={`/messages/${chat.id}`}
                  onClick={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-surface-card px-4 py-2.5 shadow-lg transition hover:bg-surface-overlay"
      >
        <IconMessage size={22} />
        <span className="text-sm font-semibold">{t("navMessages")}</span>
        {recentAvatars.length > 0 && (
          <span className="flex -space-x-2">
            {recentAvatars.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo + i}
                src={photo}
                alt=""
                className="h-6 w-6 rounded-full border-2 border-surface-card object-cover"
              />
            ))}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
