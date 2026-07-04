"use client";

import { usePathname } from "next/navigation";
import { NavLink } from "@/components/layout/NavLink";
import { useNavigationOptional } from "@/components/layout/NavigationProvider";
import { NavIcon } from "@/components/layout/NavIcons";
import { useAccess } from "@/lib/hooks/useAccess";

function isNavActive(pathname: string, href: string, pendingHref: string | null) {
  const check = pendingHref ?? pathname;
  return check.startsWith(href) || (href === "/home" && check === "/");
}

const ICON_INDEX: Record<string, number> = {
  "/home": 0,
  "/events": 1,
  "/team": 2,
  "/profile": 3,
};

export function BottomNav() {
  const pathname = usePathname();
  const navigation = useNavigationOptional();
  const pending = navigation?.pendingHref ?? null;
  const { isGuest } = useAccess();

  const active = (href: string) => isNavActive(pathname, href, pending);
  const profileHref = isGuest ? "/welcome?reason=auth-required" : "/profile";

  const items = [
    { href: "/home" },
    { href: "/events" },
    { href: "/team" },
    { href: "/profile", overrideHref: profileHref },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
      <div className="flex items-center bg-white dark:bg-black">
        {items.map(({ href, overrideHref }) => (
          <NavLink
            key={href}
            href={overrideHref ?? href}
            aria-current={active(href) ? "page" : undefined}
            className="flex flex-1 items-center justify-center py-3 transition-transform active:scale-90"
          >
            <NavIcon index={ICON_INDEX[href]} active={active(href)} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
