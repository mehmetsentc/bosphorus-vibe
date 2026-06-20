import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOTEL_NAME } from "@/lib/brand";
import { getEventForSeo } from "@/lib/seo/events-server";
import { buildEventJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata, truncateDescription } from "@/lib/seo/metadata";
import { EventDetailClient } from "./EventDetailClient";

export const revalidate = 3600;

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = await getEventForSeo(params.id);

  if (!event) {
    return buildPageMetadata({
      title: "Etkinlik Bulunamadı",
      description: `${HOTEL_NAME} etkinlik listesi.`,
      path: `/events/${params.id}`,
      noIndex: true,
    });
  }

  const description =
    event.eventDescription.trim() ||
    `${event.eventName} — ${HOTEL_NAME}, ${event.eventLocation || "Side, Antalya"}. ${event.eventTimeLabel}`;

  return buildPageMetadata({
    title: `${event.eventName} — ${HOTEL_NAME}`,
    description: truncateDescription(description, 160),
    path: `/events/${params.id}`,
    keywords: [
      event.eventName,
      event.eventCategory,
      "Bosphorus Sorgun etkinlik",
      "Side otel aktivite",
    ],
    image: event.eventImage || undefined,
    imageAlt: `${event.eventName} — ${HOTEL_NAME}`,
    ogType: "article",
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEventForSeo(params.id);

  return (
    <>
      {event ? <JsonLd data={buildEventJsonLd(event)} /> : null}
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        }
      >
        <EventDetailClient id={params.id} />
      </Suspense>
    </>
  );
}
