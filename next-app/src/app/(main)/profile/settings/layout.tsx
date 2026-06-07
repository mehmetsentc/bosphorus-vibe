import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Settings",
  description: "Manage your Bosphorus Vibe preferences, privacy, and account.",
  path: "/profile/settings",
  noIndex: true,
});

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
