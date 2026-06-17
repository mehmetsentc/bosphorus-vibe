"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { BRAND_NAME } from "@/lib/brand";

const NAV: { href: string; label: string; icon: string; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/events", label: "Etkinlikler", icon: "🎭" },
  { href: "/admin/users", label: "Üyeler", icon: "👥" },
  { href: "/admin/posts", label: "Postlar", icon: "📸" },
  { href: "/admin/tools", label: "Araçlar", icon: "⚙️" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { isAdmin } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c] px-6 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-xl font-bold text-white">Yetkisiz Erişim</h1>
        <p className="mt-2 max-w-sm text-sm text-white/50">
          Bu panele yalnızca admin yetkisine sahip hesaplar erişebilir.
        </p>
        <Link
          href="/home"
          className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-black"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
          Admin Panel
        </p>
        <p className="mt-1 font-display text-lg font-bold text-white">{BRAND_NAME}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gold/15 text-gold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/home"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          ← Uygulamaya Dön
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-panel min-h-screen bg-[#0c0c0c] text-white">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0c0c0c]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">Admin</p>
          <p className="text-sm font-semibold">{BRAND_NAME}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm"
          aria-label="Menü"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-h-screen lg:min-h-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#111] transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="hidden border-b border-white/10 px-8 py-5 lg:block">
            <h1 className="font-display text-2xl font-bold">
              {NAV.find((n) => isActive(pathname, n.href, n.exact))?.label ?? "Admin"}
            </h1>
            <p className="mt-0.5 text-sm text-white/45">
              Bosphorus Vibe yönetim merkezi
            </p>
          </div>
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
