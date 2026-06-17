"use client";

import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { NavLink } from "@/components/layout/NavLink";
import { useNavigationOptional } from "@/components/layout/NavigationProvider";
import { NavIcon } from "@/components/layout/NavIcons";
import { useAccess } from "@/lib/hooks/useAccess";
import { useRole } from "@/lib/hooks/useRole";
import { useT } from "@/components/providers/I18nProvider";
import { BRAND_NAME } from "@/lib/brand";

function isNavActive(pathname: string, href: string, pendingHref: string | null) {
  const check = pendingHref ?? pathname;
  return check.startsWith(href) || (href === "/home" && check === "/");
}

export function SidebarNav() {
  const pathname = usePathname();
  const navigation = useNavigationOptional();
  const pendingHref = navigation?.pendingHref ?? null;
  const t = useT();
  const { isGuest } = useAccess();
  const { isAdmin } = useRole();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[244px] flex-col border-r border-border bg-background px-3 py-8 md:flex">
      <NavLink
        href="/brand"
        className="mb-8 flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-surface-overlay"
      >
        <LogoMark prominent className="h-12 w-12 shrink-0" />
        <span className="min-w-0 font-display text-[15px] font-bold leading-tight tracking-tight">
          <span className="gold-text block">{BRAND_NAME.split(" ")[0]}</span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/85">
            {BRAND_NAME.split(" ").slice(1).join(" ") || "Vibe"}
          </span>
        </span>
      </NavLink>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item, index) => {
          const active = isNavActive(pathname, item.href, pendingHref);
          const href =
            isGuest && (item.href === "/profile" || item.href === "/messages")
              ? "/welcome?reason=auth-required"
              : item.href;
          return (
            <NavLink
              key={item.href}
              href={href}
              className={`flex items-center gap-4 rounded-lg px-3 py-3 text-[15px] transition active:scale-[0.98] hover:bg-surface-overlay ${
                active ? "font-bold" : "font-normal text-foreground"
              }`}
            >
              <NavIcon index={index} active={active} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
        {isAdmin && (
          <NavLink
            href="/admin"
            className={`mt-2 flex items-center gap-4 rounded-lg border border-gold/20 px-3 py-3 text-[15px] transition active:scale-[0.98] hover:bg-gold/10 ${
              pathname.startsWith("/admin") ? "font-bold text-gold" : "font-normal text-gold/80"
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
