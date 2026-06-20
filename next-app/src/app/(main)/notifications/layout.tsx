import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Bildirimler",
  description: "Bosphorus Vibe bildirimleriniz.",
  path: "/notifications",
  noIndex: true,
});

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
