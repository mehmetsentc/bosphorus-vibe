import type { Metadata } from "next";
import { EventsLayoutClient } from "@/components/events/EventsLayoutClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOTEL_NAME } from "@/lib/brand";
import { listEventsForSeo } from "@/lib/seo/events-server";
import { buildEventsItemListJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: `${HOTEL_NAME} — Günlük Etkinlik Takvimi`,
  description:
    "Bosphorus Sorgun Hotel günlük spor programı, show time etkinlikleri ve aktivite takvimi. Tarih ve kategoriye göre filtreleyin — Side, Antalya.",
  path: "/events",
  keywords: [
    "otel etkinlik takvimi",
    "günlük spor programı",
    "show time Side",
    "hotel events schedule",
    "Bosphorus Sorgun activities",
  ],
});

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await listEventsForSeo(50);

  return (
    <>
      <JsonLd data={buildEventsItemListJsonLd(events)} />
      <EventsLayoutClient>{children}</EventsLayoutClient>
    </>
  );
}
