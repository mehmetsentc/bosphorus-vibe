import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { BRAND_NAME, HOTEL_NAME } from "@/lib/brand";

export const metadata: Metadata = buildPageMetadata({
  title: `${BRAND_NAME} Topluluğu — ${HOTEL_NAME} Misafirleri`,
  description:
    "Bosphorus Sorgun Hotel misafirleri ve Bosphorus Vibe topluluğu. Otel etkinliklerine katılan profilleri keşfedin.",
  path: "/members",
  keywords: [
    "otel misafirleri",
    "Bosphorus Vibe community",
    "Side hotel guests",
  ],
});

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
