"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  listFollowerUsers,
  listFollowingUsers,
  type PublicUser,
} from "@/lib/services/friends";
import { findOrCreateDirectChat, sendMessage, canRecipientReceiveMessages } from "@/lib/services/messages";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { IconSend } from "@/components/icons/Icons";

type ContactTab = "following" | "followers";

type NewMessageSheetProps = {
  open: boolean;
  onClose: () => void;
};

function UserRow({
  user: u,
  selected,
  onSelect,
}: {
  user: PublicUser;
  selected: boolean;
  onSelect: () => void;
}) {
  const name = u.display_name || u.userName || "user";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
        selected ? "bg-gold/15 ring-1 ring-gold/40" : "hover:bg-surface-overlay"
      }`}
    >
      {u.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={u.photo_url}
          alt=""
          className="h-11 w-11 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
          {name[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted">@{u.userName || name}</p>
      </div>
    </button>
  );
}

export function NewMessageSheet({ open, onClose }: NewMessageSheetProps) {
  const { user } = useAuth();
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState<ContactTab>("following");
  const [following, setFollowing] = useState<PublicUser[]>([]);
  const [followers, setFollowers] = useState<PublicUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PublicUser | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [followingList, followerList] = await Promise.all([
      listFollowingUsers(user.uid),
      listFollowerUsers(user.uid),
    ]);
    setFollowing(followingList);
    setFollowers(followerList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelected(null);
      setMessage("");
      setTab("following");
      setSendError(null);
      load();
    }
  }, [open, load]);

  const activeList = tab === "following" ? following : followers;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.userName.toLowerCase().includes(q),
    );
  }, [activeList, search]);

  const emptyMessage =
    tab === "following" ? t("messagesNoFollowing") : t("messagesNoFollowers");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selected || !message.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const check = await canRecipientReceiveMessages(selected.uid, user.uid);
      if (!check.allowed) {
        setSendError(
          check.reason === "followers"
            ? t("messagesPrivacyFollowers")
            : t("messagesPrivacyOff"),
        );
        return;
      }
      const chatId = await findOrCreateDirectChat(user.uid, selected.uid);
      await sendMessage(chatId, user.uid, message.trim());
      onClose();
      router.push(`/messages/${chatId}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-surface-card md:rounded-2xl md:border"
          >
            <div className="shrink-0 p-6 pb-4">
              <h2 className="font-display text-xl font-bold">
                {t("messagesNewMessage")}
              </h2>
              <p className="mt-1 text-sm text-muted">{t("messagesNewMessageDesc")}</p>

              <div className="mt-4 flex rounded-xl border border-border bg-surface-overlay p-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("following");
                    setSelected(null);
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                    tab === "following"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted"
                  }`}
                >
                  {t("following")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("followers");
                    setSelected(null);
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                    tab === "followers"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted"
                  }`}
                >
                  {t("followers")}
                </button>
              </div>

              <input
                type="search"
                placeholder={t("searchName")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-3 w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-gold/50"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : !filtered.length ? (
                <p className="py-12 text-center text-sm text-muted">
                  {search.trim() ? t("userNotFound") : emptyMessage}
                </p>
              ) : (
                <ul className="space-y-1 pb-2">
                  {filtered.map((u) => (
                    <li key={u.uid}>
                      <UserRow
                        user={u}
                        selected={selected?.uid === u.uid}
                        onSelect={() => setSelected(u)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="shrink-0 border-t border-border p-4 safe-area-pb"
            >
              {selected && (
                <p className="mb-2 truncate text-xs text-muted">
                  {t("messagesTo")}{" "}
                  <span className="font-semibold text-foreground">
                    {selected.display_name || selected.userName}
                  </span>
                </p>
              )}
              {sendError && (
                <p className="mb-2 text-xs text-red-400">{sendError}</p>
              )}
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface-overlay px-4 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagesTypePlaceholder")}
                  disabled={!selected || sending}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!selected || !message.trim() || sending}
                  aria-label={t("messagesSend")}
                  className="rounded-full p-1 text-gold transition enabled:hover:brightness-110 disabled:opacity-40"
                >
                  <IconSend size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
