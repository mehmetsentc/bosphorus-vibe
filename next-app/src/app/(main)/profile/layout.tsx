import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Profile",
  description: "Your Bosphorus Vibe profile — posts, reels and activity.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
