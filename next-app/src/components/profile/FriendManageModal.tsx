"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  followUser,
  getFollowingSet,
  listUsersForFriends,
  unfollowUser,
  type PublicUser,
} from "@/lib/services/friends";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";

type FriendManageModalProps = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

export function FriendManageModal({
  open,
  onClose,
  onChanged,
}: FriendManageModalProps) {
  const { user } = useAuth();
  const t = useT();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [list, followingSet] = await Promise.all([
      listUsersForFriends(user.uid),
      getFollowingSet(user.uid),
    ]);
    setUsers(list);
    setFollowing(followingSet);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(q) ||
        u.userName.toLowerCase().includes(q),
    );
  }, [users, search]);

  async function toggleFollow(target: PublicUser) {
    if (!user) return;
    setBusyUid(target.uid);
    try {
      if (following.has(target.uid)) {
        await unfollowUser(user.uid, target.uid);
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(target.uid);
          return next;
        });
      } else {
        await followUser(user.uid, target.uid);
        setFollowing((prev) => new Set(prev).add(target.uid));
      }
      onChanged();
    } finally {
      setBusyUid(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-surface-card p-6 pb-8"
          >
            <h2 className="font-display text-xl font-bold">{t("addFriend")}</h2>
            <p className="mt-1 text-sm text-muted">{t("followUnfollowHint")}</p>

            <input
              type="search"
              placeholder={t("searchName")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-4 w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-vibe/50"
            />

            <div className="mt-4 flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
                </div>
              ) : !filtered.length ? (
                <p className="py-12 text-center text-sm text-muted">
                  {t("userNotFound")}
                </p>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((u) => {
                    const isFriend = following.has(u.uid);
                    return (
                      <li
                        key={u.uid}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-overlay px-3 py-2.5"
                      >
                        {u.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.photo_url}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-sm font-bold text-gold">
                            {(u.display_name || u.userName)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {u.display_name || u.userName}
                          </p>
                          {u.role && u.role !== "user" && (
                            <p className="truncate text-xs text-muted">{u.role}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={busyUid === u.uid}
                          onClick={() => toggleFollow(u)}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                            isFriend
                              ? "border border-border bg-surface-card text-muted hover:text-foreground"
                              : "bg-vibe text-background"
                          }`}
                        >
                          {busyUid === u.uid
                            ? "…"
                            : isFriend
                              ? t("unfollow")
                              : t("follow")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
