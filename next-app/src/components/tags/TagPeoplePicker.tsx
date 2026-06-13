"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listFollowerUsers,
  listFollowingUsers,
  type PublicUser,
} from "@/lib/services/friends";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import type { PostTag } from "@/types";

type ContactTab = "following" | "followers";

type TagPeoplePickerProps = {
  value: PostTag[];
  onChange: (tags: PostTag[]) => void;
  className?: string;
  variant?: "light" | "dark";
  /** When true, show the contact list immediately (no outer toggle). */
  embedded?: boolean;
};

function toTag(user: PublicUser): PostTag {
  return {
    uid: user.uid,
    userName: user.userName || user.display_name || user.uid,
    displayName: user.display_name || user.userName,
  };
}

export function TagPeoplePicker({
  value,
  onChange,
  className = "",
  variant = "light",
  embedded = false,
}: TagPeoplePickerProps) {
  const { user } = useAuth();
  const t = useT();
  const [tab, setTab] = useState<ContactTab>("following");
  const [following, setFollowing] = useState<PublicUser[]>([]);
  const [followers, setFollowers] = useState<PublicUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(embedded);

  const isDark = variant === "dark";
  const selectedIds = useMemo(() => new Set(value.map((v) => v.uid)), [value]);
  const panelOpen = embedded || open;

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
    if (panelOpen) load();
  }, [panelOpen, load]);

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

  function togglePerson(person: PublicUser) {
    const tag = toTag(person);
    if (selectedIds.has(tag.uid)) {
      onChange(value.filter((v) => v.uid !== tag.uid));
    } else {
      onChange([...value, tag]);
    }
  }

  function removeTag(uid: string) {
    onChange(value.filter((v) => v.uid !== uid));
  }

  const shell = isDark
    ? "border-white/10 bg-white/5"
    : "border-border bg-surface-overlay";
  const input = isDark
    ? "border-white/10 bg-white/5 text-white placeholder:text-white/40"
    : "border-border bg-background text-foreground placeholder:text-muted";
  const tabActive = isDark ? "bg-white/15 text-white" : "bg-background text-foreground shadow-sm";
  const tabIdle = isDark ? "text-white/50" : "text-muted";

  return (
    <div className={className}>
      {!embedded && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${shell}`}
        >
          <span className={isDark ? "text-white/80" : "text-foreground"}>
            {value.length
              ? t("tagPeopleCount").replace("{count}", String(value.length))
              : t("tagPeople")}
          </span>
          <span className={isDark ? "text-white/40" : "text-muted"}>{open ? "▴" : "▾"}</span>
        </button>
      )}

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag.uid}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                isDark ? "bg-white/10 text-white" : "bg-surface-overlay text-foreground"
              }`}
            >
              @{tag.userName}
              <button
                type="button"
                onClick={() => removeTag(tag.uid)}
                aria-label={t("removeTag")}
                className={isDark ? "text-white/60 hover:text-white" : "text-muted hover:text-foreground"}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {panelOpen && (
        <div className={`mt-3 rounded-xl border p-3 ${shell}`}>
          <p className={`mb-3 text-xs ${isDark ? "text-white/50" : "text-muted"}`}>
            {t("tagPeopleDesc")}
          </p>

          <div className={`mb-3 flex rounded-lg border p-1 ${isDark ? "border-white/10" : "border-border"}`}>
            <button
              type="button"
              onClick={() => setTab("following")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
                tab === "following" ? tabActive : tabIdle
              }`}
            >
              {t("following")}
            </button>
            <button
              type="button"
              onClick={() => setTab("followers")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
                tab === "followers" ? tabActive : tabIdle
              }`}
            >
              {t("followers")}
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchName")}
            className={`mb-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-gold/50 ${input}`}
          />

          <div className="max-h-44 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            ) : !filtered.length ? (
              <p className={`py-6 text-center text-xs ${isDark ? "text-white/50" : "text-muted"}`}>
                {search.trim() ? t("userNotFound") : t("tagPeopleEmpty")}
              </p>
            ) : (
              <ul className="space-y-1">
                {filtered.map((person) => {
                  const selected = selectedIds.has(person.uid);
                  const name = person.display_name || person.userName || "user";
                  return (
                    <li key={person.uid}>
                      <button
                        type="button"
                        onClick={() => togglePerson(person)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                          selected
                            ? isDark
                              ? "bg-gold/20 ring-1 ring-gold/40"
                              : "bg-gold/10 ring-1 ring-gold/30"
                            : isDark
                              ? "hover:bg-white/5"
                              : "hover:bg-surface-card"
                        }`}
                      >
                        {person.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={person.photo_url}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-overlay text-xs font-bold text-gold">
                            {name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : ""}`}>
                            {name}
                          </p>
                          <p className={`truncate text-xs ${isDark ? "text-white/50" : "text-muted"}`}>
                            @{person.userName || name}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold ${selected ? "text-gold" : isDark ? "text-white/40" : "text-muted"}`}>
                          {selected ? "✓" : t("tagAdd")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
