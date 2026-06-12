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

// icon index map (from NavIcons ICONS array)
const ICON_INDEX: Record<string, number> = {
  "/home": 0,
  "/events": 1,
  "/reels": 2,
  "/team": 4,
  "/profile": 5,
};

export function BottomNav() {
  const pathname = usePathname();
  const navigation = useNavigationOptional();
  const pending = navigation?.pendingHref ?? null;
  const { isGuest } = useAccess();

  const active = (href: string) => isNavActive(pathname, href, pending);
  const profileHref = isGuest ? "/welcome?reason=auth-required" : "/profile";

  const sideItems = [
    { href: "/home" },
    { href: "/events" },
  ];
  const sideItemsRight = [
    { href: "/team" },
    { href: "/profile", overrideHref: profileHref },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

      <div className="relative flex items-center bg-white dark:bg-black">

        {/* Left items: Home, Events */}
        {sideItems.map(({ href }) => (
          <NavLink
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className="flex flex-1 items-center justify-center py-3 transition-transform active:scale-90"
          >
            <NavIcon index={ICON_INDEX[href]} active={active(href)} />
          </NavLink>
        ))}

        {/* Center — Reels floating red circle */}
        <div className="relative flex flex-1 flex-col items-center">
          <NavLink
            href="/reels"
            aria-current={active("/reels") ? "page" : undefined}
            className="absolute -top-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-full transition-transform active:scale-90"
            style={{
              background: "#e50914",
              boxShadow: "0 4px 18px rgba(229,9,20,0.4)",
            }}
          >
            {/* Reels icon in white inside the red circle */}
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </NavLink>
          {/* Height spacer */}
          <div className="h-14" />
        </div>

        {/* Right items: Team, Profile */}
        {sideItemsRight.map(({ href, overrideHref }) => (
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
