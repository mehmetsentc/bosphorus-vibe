"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAdminStatsClient } from "@/lib/admin/client-ops";

type Stats = { users: number; posts: number; events: number };

const QUICK_LINKS = [
  { href: "/admin/events", label: "Etkinlik Ekle / Düzenle", icon: "🎭", desc: "Gösteri ve spor etkinlikleri" },
  { href: "/admin/users", label: "Üye & Rol Yönetimi", icon: "👥", desc: "Admin yetkisi ver / al" },
  { href: "/admin/posts", label: "Post Moderasyonu", icon: "📸", desc: "İçerikleri görüntüle ve sil" },
  { href: "/admin/tools", label: "Video Araçları", icon: "⚙️", desc: "Encode ve kapak üretimi" },
] as const;

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    fetchAdminStatsClient()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) {
          setStats(null);
          setError("İstatistikler alınamadı");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Toplam Üye", value: stats?.users, href: "/admin/users" },
    { label: "Toplam Post", value: stats?.posts, href: "/admin/posts" },
    { label: "Etkinlik", value: stats?.events, href: "/admin/events" },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-gold/30 hover:bg-gold/5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {loading ? (
                <span className="animate-pulse text-white/30">—</span>
              ) : (
                (value ?? 0).toLocaleString("tr-TR")
              )}
            </p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
          Hızlı Erişim
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, label, icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/25 hover:bg-gold/5"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-white">{label}</p>
                <p className="mt-0.5 text-xs text-white/45">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
