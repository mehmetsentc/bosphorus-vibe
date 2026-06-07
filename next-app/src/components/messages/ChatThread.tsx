"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useT } from "@/components/providers/I18nProvider";
import { ChatOptionsSheet } from "@/components/messages/ChatOptionsSheet";
import {
  deleteMessage,
  getChat,
  markChatSeen,
  sendMessage,
  subscribeMessages,
} from "@/lib/services/messages";
import type { ChatMessageDoc } from "@/types";
import { IconSend } from "@/components/icons/Icons";

type ChatThreadProps = {
  chatId: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  otherUserId?: string;
  compact?: boolean;
  showOptions?: boolean;
};

export function ChatThread({
  chatId,
  otherUserName,
  otherUserPhoto,
  otherUserId,
  compact = false,
  showOptions = true,
}: ChatThreadProps) {
  const t = useT();
  const { user } = useAuth();
  const { prefs } = useSettings();
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSpam, setIsSpam] = useState(false);
  const [seenByOther, setSeenByOther] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const name = otherUserName || t("user");

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeMessages(chatId, setMessages);
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!user || !chatId) return;
    markChatSeen(chatId, user.uid).catch(() => {});
  }, [chatId, user, messages.length]);

  useEffect(() => {
    if (!user || !chatId) return;
    getChat(chatId).then((chat) => {
      if (!chat) return;
      setIsHidden(chat.hiddenByIds?.includes(user.uid) ?? false);
      setIsSpam(chat.spamByIds?.includes(user.uid) ?? false);
      if (otherUserId && prefs.messageReadReceipts) {
        setSeenByOther(chat.lastMessageSeenByIds.includes(otherUserId));
      } else {
        setSeenByOther(false);
      }
    });
  }, [chatId, user, otherUserId, prefs.messageReadReceipts, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(chatId, user.uid, text);
      setText("");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!user || deletingId) return;
    setDeletingId(messageId);
    try {
      await deleteMessage(messageId, user.uid);
    } finally {
      setDeletingId(null);
    }
  }

  const lastOwnMessage = [...messages].reverse().find((m) => m.userId === user?.uid);
  const showSeen =
    seenByOther &&
    prefs.messageReadReceipts &&
    lastOwnMessage &&
    lastOwnMessage.id === messages[messages.length - 1]?.id;

  return (
    <>
      <div className={`flex min-h-0 flex-1 flex-col ${compact ? "" : "bg-background"}`}>
        {!compact && (
          <header className="hidden shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 md:flex">
            <div className="min-w-0 flex-1">
              {otherUserId ? (
                <Link href={`/user/${otherUserId}`} className="flex items-center gap-3">
                  {otherUserPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={otherUserPhoto}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="truncate font-semibold">{name}</span>
                </Link>
              ) : (
                <span className="font-semibold">{name}</span>
              )}
            </div>
            {showOptions && user && (
              <button
                type="button"
                onClick={() => setOptionsOpen(true)}
                aria-label={t("messagesChatOptions")}
                className="rounded-lg p-2 text-muted transition hover:bg-surface-overlay hover:text-foreground"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            )}
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              {t("messagesStartConversation")}
            </p>
          ) : (
            <ul className="space-y-2">
              {messages.map((msg) => {
                const mine = msg.userId === user?.uid;
                return (
                  <li
                    key={msg.id}
                    className={`group flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className="relative max-w-[75%]">
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm ${
                          mine
                            ? "bg-gold text-black"
                            : "bg-surface-overlay text-foreground"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {mine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          disabled={deletingId === msg.id}
                          aria-label={t("messagesDeleteMessage")}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-muted opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {showSeen && (
            <p className="mt-2 text-right text-xs text-muted">
              {t("messagesSeen")}
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-border px-3 py-3 safe-area-pb"
        >
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-card px-4 py-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("messagesTypePlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              disabled={!user}
            />
            <button
              type="submit"
              disabled={!user || !text.trim() || sending}
              aria-label={t("messagesSend")}
              className="rounded-full p-1 text-gold transition enabled:hover:brightness-110 disabled:opacity-40"
            >
              <IconSend size={20} />
            </button>
          </div>
        </form>
      </div>

      {user && (
        <ChatOptionsSheet
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          chatId={chatId}
          currentUid={user.uid}
          otherUserId={otherUserId}
          otherUserName={otherUserName}
          isHidden={isHidden}
          isSpam={isSpam}
        />
      )}
    </>
  );
}
