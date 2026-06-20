import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_INSTAGRAM, BRAND_NAME, HOTEL_NAME } from "@/lib/brand";

export const metadata: Metadata = buildPageMetadata({
  title: `${BRAND_NAME} — ${HOTEL_NAME} Resmi Profil`,
  description:
    `${HOTEL_NAME} resmi Bosphorus Vibe profili — etkinlik posterleri, reels ve @${BRAND_INSTAGRAM.handle} içerikleri.`,
  path: "/brand",
  keywords: [
    "bosphorusvibe instagram",
    "Bosphorus Sorgun official",
    "otel etkinlik posterleri",
  ],
});

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
