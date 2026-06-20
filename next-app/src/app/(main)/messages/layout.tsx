import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Mesajlar",
  description: "Bosphorus Vibe özel mesajlar.",
  path: "/messages",
  noIndex: true,
});

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
