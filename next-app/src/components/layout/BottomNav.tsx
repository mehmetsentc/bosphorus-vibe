"use client";

import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS } from "@/components/layout/nav-config";
import { NavLink } from "@/components/layout/NavLink";
import { useNavigationOptional } from "@/components/layout/NavigationProvider";
import { NavIcon } from "@/components/layout/NavIcons";
import { useAccess } from "@/lib/hooks/useAccess";

function isNavActive(pathname: string, href: string, pendingHref: string | null) {
  const check = pendingHref ?? pathname;
  return check.startsWith(href) || (href === "/home" && check === "/");
}

export function BottomNav() {
  const pathname = usePathname();
  const navigation = useNavigationOptional();
  const pendingHref = navigation?.pendingHref ?? null;
  const { isGuest } = useAccess();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2.5 safe-area-pb">
        {BOTTOM_NAV_ITEMS.map((tab, index) => {
          const navIndex = tab.href === "/home" ? 0
            : tab.href === "/events" ? 1
            : tab.href === "/reels" ? 2
            : tab.href === "/team" ? 4
            : 5;
          const active = isNavActive(pathname, tab.href, pendingHref);
          const href =
            isGuest && tab.href === "/profile"
              ? "/welcome?reason=auth-required"
              : tab.href;
          return (
            <NavLink
              key={tab.href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex p-2 transition active:scale-95 ${
                active ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              <NavIcon index={navIndex} active={active} />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
