import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HOTEL_NAME } from "@/lib/brand";

export const metadata: Metadata = buildPageMetadata({
  title: `${HOTEL_NAME} — Otel Reels & Videolar`,
  description:
    "Bosphorus Sorgun Hotel reels — günlük aktiviteler, eğlence anları ve otel yaşamı. Side, Antalya dikey video akışı.",
  path: "/reels",
  keywords: [
    "otel reels",
    "Bosphorus Sorgun video",
    "Side hotel entertainment",
    "vacation reels",
  ],
});

export default function ReelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
