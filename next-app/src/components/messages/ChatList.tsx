"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { ChatListItem } from "@/components/messages/ChatListItem";
import {
  enrichChatPreviews,
  filterChatsByInbox,
  subscribeChats,
  type ChatInboxFilter,
  type ChatPreview,
} from "@/lib/services/messages";

type ChatListProps = {
  activeChatId?: string;
  onSelect?: (chatId: string) => void;
  compact?: boolean;
  onCompose?: () => void;
  filter?: ChatInboxFilter;
};

const FILTERS: ChatInboxFilter[] = ["inbox", "hidden", "spam"];

export function ChatList({
  activeChatId,
  onSelect,
  compact,
  onCompose,
  filter: filterProp,
}: ChatListProps) {
  const t = useT();
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter =
    filterProp ??
    ((searchParams.get("filter") as ChatInboxFilter | null) || "inbox");
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeChats(
      user.uid,
      async (raw) => {
        const enriched = await enrichChatPreviews(raw, user.uid);
        setChats(enriched);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsub;
  }, [user]);

  const filteredChats = useMemo(
    () => (user ? filterChatsByInbox(chats, user.uid, filter) : []),
    [chats, filter, user],
  );

  const unreadCount = useMemo(
    () =>
      user
        ? filterChatsByInbox(chats, user.uid, "inbox").filter((c) => c.unread)
            .length
        : 0,
    [chats, user],
  );

  const emptyMessages: Record<ChatInboxFilter, string> = {
    inbox: t("messagesEmptyDesc"),
    hidden: t("messagesHiddenEmpty"),
    spam: t("messagesSpamEmpty"),
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm text-muted">{t("messagesLoginRequired")}</p>
        <Link
          href="/welcome?reason=auth-required"
          className="mt-4 text-sm font-semibold text-gold hover:brightness-110"
        >
          {t("loginWithGoogle")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!compact && (
        <header className="flex shrink-0 flex-col border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <h1 className="font-display text-xl font-bold">{t("navMessages")}</h1>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && filter === "inbox" && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-black">
                  {unreadCount}
                </span>
              )}
              {onCompose && (
                <button
                  type="button"
                  onClick={onCompose}
                  aria-label={t("messagesNewMessage")}
                  className="rounded-lg p-1.5 text-gold transition hover:bg-surface-overlay"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-1 px-3 pb-3">
            {FILTERS.map((f) => {
              const active = filter === f;
              const labels: Record<ChatInboxFilter, string> = {
                inbox: t("messagesFilterInbox"),
                hidden: t("messagesFilterHidden"),
                spam: t("messagesFilterSpam"),
              };
              const href =
                f === "inbox" ? "/messages" : `/messages?filter=${f}`;
              return (
                <Link
                  key={f}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-gold text-black"
                      : "bg-surface-overlay text-muted hover:text-foreground"
                  }`}
                >
                  {labels[f]}
                </Link>
              );
            })}
          </div>
        </header>
      )}

      {!filteredChats.length ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-lg font-semibold">
            {filter === "inbox"
              ? t("messagesEmptyTitle")
              : filter === "hidden"
                ? t("messagesFilterHidden")
                : t("messagesFilterSpam")}
          </p>
          <p className="mt-2 text-sm text-muted">{emptyMessages[filter]}</p>
          {filter === "inbox" && onCompose && (
            <button
              type="button"
              onClick={onCompose}
              className="mt-4 text-sm font-semibold text-gold hover:brightness-110"
            >
              {t("messagesFindPeople")}
            </button>
          )}
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto py-1">
          {filteredChats.map((chat) => {
            const href =
              filter === "inbox"
                ? `/messages/${chat.id}`
                : `/messages/${chat.id}?filter=${filter}`;
            const active =
              activeChatId === chat.id || pathname === `/messages/${chat.id}`;
            return (
              <li key={chat.id}>
                <ChatListItem
                  chat={chat}
                  active={active}
                  href={onSelect ? undefined : href}
                  onClick={onSelect ? () => onSelect(chat.id) : undefined}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
