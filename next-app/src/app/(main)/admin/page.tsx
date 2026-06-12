"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { PageShell } from "@/components/layout/PageShell";
import { AdminDashboard } from "./AdminDashboard";
import { AdminEvents } from "./AdminEvents";
import { AdminUsers } from "./AdminUsers";
import { AdminPosts } from "./AdminPosts";
import { AdminTools } from "./AdminTools";

type Tab = "dashboard" | "events" | "users" | "posts" | "tools";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "events",    label: "Etkinlikler", icon: "🎭" },
  { id: "users",     label: "Üyeler",   icon: "👥" },
  { id: "posts",     label: "Postlar",  icon: "📸" },
  { id: "tools",     label: "Araçlar",  icon: "⚙️" },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { isAdmin } = useRole();
  const [tab, setTab] = useState<Tab>("dashboard");

  // Allow quick-nav from Dashboard cards
  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent).detail as Tab;
      if (t) setTab(t);
    };
    window.addEventListener("admin-tab", handler);
    return () => window.removeEventListener("admin-tab", handler);
  }, []);

  if (loading) {
    return (
      <PageShell className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </PageShell>
    );
  }

  if (!user || !isAdmin) {
    return (
      <PageShell className="px-4 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-3 font-semibold">Yetkisiz Erişim</p>
        <p className="mt-1 text-sm text-muted">Bu sayfaya erişim için admin yetkisi gereklidir.</p>
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-safe">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Admin Paneli</p>
        <p className="text-lg font-bold leading-tight">Bosphorus Vibe</p>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 flex overflow-x-auto border-b border-border bg-background/95 backdrop-blur-md">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex shrink-0 flex-col items-center gap-0.5 px-4 py-2.5 text-[11px] font-semibold transition ${
              tab === id
                ? "border-b-2 border-gold text-gold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-5">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "events"    && <AdminEvents />}
        {tab === "users"     && <AdminUsers />}
        {tab === "posts"     && <AdminPosts />}
        {tab === "tools"     && <AdminTools />}
      </div>
    </PageShell>
  );
}
