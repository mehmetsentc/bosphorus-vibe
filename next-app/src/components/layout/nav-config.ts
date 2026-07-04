import type { MessageKey } from "@/i18n/messages";

export type NavItem = {
  href: string;
  labelKey: MessageKey;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/home", labelKey: "navHome" },
  { href: "/events", labelKey: "navEvents" },
  { href: "/team", labelKey: "navTeam" },
  { href: "/profile", labelKey: "navProfile" },
];

export const BOTTOM_NAV_ITEMS = NAV_ITEMS;
