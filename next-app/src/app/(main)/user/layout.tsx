import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Kullanıcı Profili",
  description: "Bosphorus Vibe kullanıcı profili.",
  path: "/user",
  noIndex: true,
});

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
