"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchAdminUsersClient,
  fetchAdminStatsClient,
  updateUserRoleClient,
  type AdminUserRow,
} from "@/lib/admin/client-ops";
import {
  CANONICAL_ANIMATION_TEAM,
  getRoleBadgeClass,
  getRoleDisplayLabel,
  isAdminRole,
  isAnimationTeamRole,
  matchesAdminRoleFilter,
  normalizeRole,
  roleSelectOptions,
  roleSelectValue,
  type AdminUserRoleFilter,
} from "@/lib/utils/roles";

const FILTERS: { id: AdminUserRoleFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "admin", label: "Adminler" },
  { id: "animation", label: "Animasyon" },
  { id: "guest", label: "Otel Misafiri" },
  { id: "member", label: "Üyeler" },
  { id: "anonymous", label: "Anonim" },
  { id: "others", label: "Diğer" },
];

export function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [rows, stats] = await Promise.all([
        fetchAdminUsersClient(),
        fetchAdminStatsClient(),
      ]);
      setUsers(rows);
      setTotalCount(stats.users);

      // Heal TR/legacy aliases → canonical "Animation Team" so /team queries find everyone.
      const toHeal = rows.filter(
        (u) => isAnimationTeamRole(u.role) && u.role !== CANONICAL_ANIMATION_TEAM,
      );
      if (toHeal.length > 0) {
        await Promise.all(
          toHeal.map((u) => updateUserRoleClient(u.uid, CANONICAL_ANIMATION_TEAM)),
        );
        setUsers((prev) =>
          prev.map((u) =>
            isAnimationTeamRole(u.role)
              ? { ...u, role: CANONICAL_ANIMATION_TEAM }
              : u,
          ),
        );
      }
    } catch {
      setUsers([]);
      setTotalCount(null);
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

  const changeRole = async (uid: string, role: string) => {
    const target = users.find((u) => u.uid === uid);
    if (uid === user?.uid && target?.role === "admin" && role !== "admin") {
      flash("Kendi admin yetkini kaldıramazsın");
      return;
    }

    setBusy(uid);
    try {
      const canonical = normalizeRole(role);
      await updateUserRoleClient(uid, canonical);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: canonical } : u)),
      );
      flash(`Rol güncellendi → ${getRoleDisplayLabel(canonical)} ✓`);
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
    const matchesRole = matchesAdminRoleFilter(u.role, roleFilter, u.isAnonymous);
    return matchesSearch && matchesRole;
  });

  const stats = useMemo(
    () => ({
      total: totalCount ?? users.length,
      admin: users.filter((u) => isAdminRole(u.role)).length,
      animation: users.filter((u) => isAnimationTeamRole(u.role)).length,
      guest: users.filter((u) => u.role === "Hotel Guest").length,
      anonymous: users.filter((u) => u.isAnonymous).length,
    }),
    [users, totalCount],
  );

  return (
    <div className="space-y-5">
      <div className="admin-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>
          <strong className="text-white">{stats.total}</strong> kayıt
        </span>
        <span>·</span>
        <span>
          <strong className="text-gold">{stats.admin}</strong> admin
        </span>
        <span>·</span>
        <span>
          <strong className="text-violet-300">{stats.animation}</strong> animasyon
        </span>
        <span>·</span>
        <span>
          <strong className="text-emerald-300">{stats.guest}</strong> otel misafiri
        </span>
        <span>·</span>
        <span>
          <strong className="text-sky-300">{stats.anonymous}</strong> anonim
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
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRoleFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              roleFilter === id
                ? "bg-gold/20 text-gold"
                : "admin-subtle bg-white/5 hover:text-white"
            }`}
          >
            {label}
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
            <thead className="admin-subtle border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="hidden px-4 py-3 md:table-cell">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-right">Rol Ata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.photo_url}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gold">
                          {(u.display_name || u.userName || "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {u.display_name || u.userName || "—"}
                        </p>
                        {u.userName && (
                          <p className="admin-subtle text-xs">@{u.userName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="admin-muted hidden px-4 py-3 md:table-cell">
                    {u.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${getRoleBadgeClass(
                          u.role,
                          { isAnonymous: u.isAnonymous },
                        )}`}
                      >
                        {getRoleDisplayLabel(u.role, { isAnonymous: u.isAnonymous })}
                      </span>
                      {u.isAnonymous && u.role !== "user" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${getRoleBadgeClass(
                            u.role,
                          )}`}
                        >
                          {getRoleDisplayLabel(u.role)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={roleSelectValue(u.role)}
                      disabled={busy === u.uid}
                      onChange={(e) => void changeRole(u.uid, e.target.value)}
                      className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none hover:bg-white/5 disabled:opacity-50"
                    >
                      {roleSelectOptions(u.role).map((role) => (
                        <option key={role} value={role}>
                          {getRoleDisplayLabel(role)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="admin-subtle py-12 text-center">Üye bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}
