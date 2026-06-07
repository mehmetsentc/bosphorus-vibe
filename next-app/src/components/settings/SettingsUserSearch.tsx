"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { listUsersForFriends } from "@/lib/services/friends";

export function SettingsUserSearch({
  onAdd,
  placeholder,
}: {
  onAdd: (uid: string, userName: string) => void;
  placeholder: string;
}) {
  const { user } = useAuth();
  const t = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ uid: string; userName: string }[]>(
    [],
  );
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!user || !query.trim()) return;
    setSearching(true);
    try {
      const users = await listUsersForFriends(user.uid);
      const q = query.trim().toLowerCase();
      setResults(
        users
          .filter(
            (u) =>
              u.userName.toLowerCase().includes(q) ||
              u.display_name.toLowerCase().includes(q),
          )
          .slice(0, 12)
          .map((u) => ({
            uid: u.uid,
            userName: u.userName || u.display_name || "user",
          })),
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-xl bg-surface-overlay px-4 py-2.5 text-sm font-medium transition hover:bg-surface-card"
        >
          {searching ? "…" : "→"}
        </button>
      </div>
      {results.length === 0 && query && !searching && (
        <p className="text-center text-sm text-muted">{t("userNotFound")}</p>
      )}
      {results.length > 0 && (
        <div className="divide-y divide-border rounded-xl border border-border">
          {results.map((u) => (
            <button
              key={u.uid}
              type="button"
              onClick={() => {
                onAdd(u.uid, u.userName);
                setResults([]);
                setQuery("");
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-surface-overlay"
            >
              @{u.userName}
              <span className="text-gold">+</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
