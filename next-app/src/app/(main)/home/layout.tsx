import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOTEL_NAME } from "@/lib/brand";
import { buildWebSiteJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildPageMetadata({
  title: `${HOTEL_NAME} — Günlük Etkinlikler & Reels`,
  description:
    "Bosphorus Sorgun Hotel'de günlük spor aktiviteleri, akşam şovları, reels ve otel eğlencesi. Side, Antalya tatil etkinlikleri tek platformda.",
  path: "/home",
  keywords: [
    "otel feed",
    "günlük otel programı",
    "Side hotel activities",
    "Bosphorus Sorgun reels",
  ],
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={buildWebSiteJsonLd()} />
      {children}
    </>
  );
}
