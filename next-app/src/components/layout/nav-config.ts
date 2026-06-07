import type { MessageKey } from "@/i18n/messages";

export type NavItem = {
  href: string;
  labelKey: MessageKey;
  accent?: "vibe";
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", labelKey: "navHome" },
  { href: "/events", labelKey: "navEvents" },
  { href: "/reels", labelKey: "navReels", accent: "vibe" },
  { href: "/messages", labelKey: "navMessages" },
  { href: "/team", labelKey: "navTeam" },
  { href: "/profile", labelKey: "navProfile" },
];

/** Bottom bar — messages accessed via floating dock on mobile */
export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter(
  (item) => item.href !== "/messages",
);
