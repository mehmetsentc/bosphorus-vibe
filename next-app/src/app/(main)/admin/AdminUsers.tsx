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

  useEffect(() => { void load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const changeRole = async (uid: string, role: "user" | "admin") => {
    setBusy(uid);
    try {
      await updateUserRoleClient(uid, role);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      flash(`Rol güncellendi → ${role} ✓`);
    } catch {
      flash("Güncelleme başarısız");
    } finally {
      setBusy(null);
    }
  };

  const filtered = users.filter((u) =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Üyeler <span className="text-sm font-normal text-muted">({users.length})</span></h2>
        <button type="button" onClick={() => void load()} className="rounded-xl border border-border px-3 py-1.5 text-xs">Yenile</button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="İsim, email veya kullanıcı adı ara…"
        className="input-field w-full"
      />

      {msg && <p className="text-center text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.uid} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-card p-3">
              {u.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
                  {(u.display_name || "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{u.display_name || u.userName || "—"}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    u.role === "admin"
                      ? "bg-gold/20 text-gold"
                      : "bg-surface-overlay text-muted"
                  }`}>
                    {u.role === "admin" ? "ADMIN" : "ÜYE"}
                  </span>
                </div>
                <p className="truncate text-xs text-muted">{u.email}</p>
                {u.created_time && (
                  <p className="text-[11px] text-muted">
                    Katıldı: {new Date(u.created_time).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                {u.role === "admin" ? (
                  <button
                    type="button"
                    disabled={busy === u.uid}
                    onClick={() => void changeRole(u.uid, "user")}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface-overlay disabled:opacity-50"
                  >
                    {busy === u.uid ? "…" : "Yetkiyi Al"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === u.uid}
                    onClick={() => void changeRole(u.uid, "admin")}
                    className="rounded-lg bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold hover:bg-gold/20 disabled:opacity-50"
                  >
                    {busy === u.uid ? "…" : "Admin Yap"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-muted">Üye bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}
