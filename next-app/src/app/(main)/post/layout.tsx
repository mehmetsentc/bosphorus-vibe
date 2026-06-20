import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Gönderi",
  description: "Bosphorus Vibe gönderisi.",
  path: "/post",
  noIndex: true,
});

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
