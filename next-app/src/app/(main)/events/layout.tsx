import type { Metadata } from "next";
import { EventsLayoutClient } from "@/components/events/EventsLayoutClient";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Daily Hotel Events & Sports Activities",
  description:
    "Browse daily sports schedules, show time events and hotel activities. Filter by date and category.",
  path: "/events",
  keywords: [
    "hotel events",
    "daily activities",
    "sports schedule",
    "show time",
    "resort entertainment",
  ],
});

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Hotel Events",
          url: siteUrl("/events"),
        }}
      />
      <EventsLayoutClient>{children}</EventsLayoutClient>
    </>
  );
}
