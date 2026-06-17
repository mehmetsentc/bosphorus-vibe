"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchAdminUsersClient,
  updateUserRoleClient,
  type AdminUserRow,
} from "@/lib/admin/client-ops";

export function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setUsers(await fetchAdminUsersClient());
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const changeRole = async (uid: string, role: "user" | "admin") => {
    if (uid === user?.uid && role === "user") {
      flash("Kendi admin yetkini kaldıramazsın");
      return;
    }
    setBusy(uid);
    try {
      await updateUserRoleClient(uid, role);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      flash(`Rol güncellendi → ${role === "admin" ? "Admin" : "Üye"} ✓`);
    } catch {
      flash("Güncelleme başarısız");
    } finally {
      setBusy(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.display_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.userName.toLowerCase().includes(q);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.role === "admin") ||
      (roleFilter === "user" && u.role !== "admin");
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
        <span>
          <strong className="text-white">{users.length}</strong> üye
        </span>
        <span>·</span>
        <span>
          <strong className="text-gold">{adminCount}</strong> admin
        </span>
        <button
          type="button"
          onClick={() => void load()}
          className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
        >
          Yenile
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "admin", "user"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setRoleFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              roleFilter === f
                ? "bg-gold/20 text-gold"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            {f === "all" ? "Tümü" : f === "admin" ? "Adminler" : "Üyeler"}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="İsim, email veya kullanıcı adı ara…"
        className="input-field w-full max-w-md"
      />

      {msg && <p className="text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="hidden px-4 py-3 md:table-cell">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gold">
                          {(u.display_name || "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {u.display_name || u.userName || "—"}
                        </p>
                        {u.userName && (
                          <p className="text-xs text-white/40">@{u.userName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-white/50 md:table-cell">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.role === "admin"
                          ? "bg-gold/20 text-gold"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {u.role === "admin" ? "ADMIN" : "ÜYE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role === "admin" ? (
                      <button
                        type="button"
                        disabled={busy === u.uid}
                        onClick={() => void changeRole(u.uid, "user")}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 disabled:opacity-50"
                      >
                        {busy === u.uid ? "…" : "Yetkiyi Al"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === u.uid}
                        onClick={() => void changeRole(u.uid, "admin")}
                        className="rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 disabled:opacity-50"
                      >
                        {busy === u.uid ? "…" : "Admin Yap"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">Üye bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}
