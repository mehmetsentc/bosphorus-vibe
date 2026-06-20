import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_NAME, HOTEL_NAME } from "@/lib/brand";

export const metadata: Metadata = buildPageMetadata({
  title: `${BRAND_NAME} Animasyon Ekibi`,
  description:
    `${HOTEL_NAME} animasyon ve eğlence ekibi — günlük aktiviteler, şovlar ve misafir deneyimi.`,
  path: "/team",
  keywords: [
    "animasyon ekibi",
    "hotel animation team",
    "Bosphorus Sorgun entertainment",
  ],
});

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
