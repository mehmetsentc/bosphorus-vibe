"use client";

import { useEffect, useState } from "react";

type Stats = { users: number; posts: number; events: number };

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Toplam Üye", value: stats?.users, icon: "👥", color: "from-blue-500/20 to-blue-600/10 border-blue-500/20" },
    { label: "Toplam Post", value: stats?.posts, icon: "📸", color: "from-purple-500/20 to-purple-600/10 border-purple-500/20" },
    { label: "Etkinlik", value: stats?.events, icon: "🎭", color: "from-gold/20 to-gold/10 border-gold/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Dashboard</h2>
        <p className="text-sm text-muted">Genel bakış</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-2xl border bg-gradient-to-br p-4 ${color}`}>
            <div className="text-2xl">{icon}</div>
            <div className="mt-2 text-xl font-bold">
              {loading ? <span className="animate-pulse text-muted">—</span> : (value ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <h3 className="mb-3 font-semibold">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["🎭 Etkinlik Ekle", "events"],
            ["👥 Üye Yönet", "users"],
            ["📸 Post Yönet", "posts"],
            ["⚙️ Araçlar", "tools"],
          ].map(([label, tab]) => (
            <button
              key={tab}
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("admin-tab", { detail: tab }))}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-left font-medium hover:bg-surface-card transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
