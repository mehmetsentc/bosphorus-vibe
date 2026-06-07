"use client";

import Link from "next/link";
import { useT } from "@/components/providers/I18nProvider";
import type { ChatPreview } from "@/lib/services/messages";

function formatRelativeTime(date: Date, locale: string): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

type ChatListItemProps = {
  chat: ChatPreview;
  active?: boolean;
  href?: string;
  onClick?: () => void;
};

export function ChatListItem({ chat, active, href, onClick }: ChatListItemProps) {
  const t = useT();
  const name = chat.otherUserName || t("user");
  const locale =
    typeof navigator !== "undefined" ? navigator.language : "tr-TR";

  const inner = (
    <>
      {chat.otherUserPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={chat.otherUserPhoto}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-lg font-bold text-gold">
          {name[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`truncate text-sm ${chat.unread ? "font-bold" : "font-semibold"}`}>
            {name}
          </p>
          <span className="shrink-0 text-[11px] text-muted">
            {formatRelativeTime(chat.lastMessageTime, locale)}
          </span>
        </div>
        <p
          className={`truncate text-sm ${
            chat.unread ? "font-semibold text-foreground" : "text-muted"
          }`}
        >
          {chat.lastMessage || t("messagesNoMessagesYet")}
        </p>
      </div>
      {chat.unread && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
      )}
    </>
  );

  const className = `flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-surface-overlay ${
    active ? "bg-surface-overlay" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}
