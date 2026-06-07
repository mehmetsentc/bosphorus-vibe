import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Reels",
  description: "Watch vertical hotel reels — activities, entertainment and guest moments.",
  path: "/reels",
  keywords: ["hotel reels", "vacation videos", "resort entertainment"],
});

export default function ReelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
