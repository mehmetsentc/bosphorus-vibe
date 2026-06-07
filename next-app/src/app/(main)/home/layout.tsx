import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND_NAME } from "@/lib/brand";
import { siteUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Hotel Entertainment & Vacation Activities",
  description:
    "Discover daily hotel events, sports activities, evening shows and reels at Bosphorus Sorgun — your vacation entertainment hub.",
  path: "/home",
  keywords: [
    "hotel entertainment",
    "vacation activities",
    "resort events",
    "Bosphorus Sorgun",
    "daily activities",
  ],
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND_NAME,
          url: siteUrl("/home"),
          description:
            "Hotel entertainment, events and vacation activities at Bosphorus Sorgun.",
        }}
      />
      {children}
    </>
  );
}
