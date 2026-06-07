import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Animation Team",
  description: "Meet the Bosphorus Vibe animation and entertainment team.",
  path: "/team",
  keywords: ["animation team", "hotel entertainment team", "Bosphorus Vibe"],
});

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
