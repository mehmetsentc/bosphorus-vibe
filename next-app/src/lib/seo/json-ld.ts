import {
  BRAND_INSTAGRAM,
  BRAND_NAME,
  HOTEL_LOCATION,
  HOTEL_NAME,
} from "@/lib/brand";
import { siteUrl } from "@/lib/seo/metadata";
import type { EventDoc } from "@/types";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: siteUrl("/welcome"),
    logo: siteUrl("/logo.png"),
    description:
      "Official entertainment and events platform for Bosphorus Sorgun Hotel guests.",
    sameAs: [BRAND_INSTAGRAM.url],
  };
}

export function buildHotelJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: HOTEL_NAME,
    url: siteUrl("/welcome"),
    description:
      "All-inclusive resort in Side, Antalya — daily activities, sports and evening shows via Bosphorus Vibe.",
    address: {
      "@type": "PostalAddress",
      addressLocality: HOTEL_LOCATION.locality,
      addressRegion: HOTEL_LOCATION.region,
      addressCountry: HOTEL_LOCATION.country,
    },
    parentOrganization: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: siteUrl("/welcome"),
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: ["bosphorusvibe", HOTEL_NAME],
    url: siteUrl("/welcome"),
    description:
      "Discover hotel events, reels, sports schedules and evening shows at Bosphorus Sorgun.",
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: siteUrl("/welcome"),
    },
    inLanguage: ["tr", "en"],
  };
}

export function buildEventsItemListJsonLd(events: EventDoc[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${HOTEL_NAME} — Daily Events & Activities`,
    url: siteUrl("/events"),
    numberOfItems: events.length,
    itemListElement: events.slice(0, 30).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: siteUrl(`/events/${event.id}`),
      name: event.eventName,
    })),
  };
}

export function buildEventJsonLd(event: EventDoc) {
  const locationName =
    event.eventLocation.trim() || `${HOTEL_NAME}, ${HOTEL_LOCATION.address}`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.eventName,
    description:
      event.eventDescription.trim() ||
      `${event.eventName} at ${HOTEL_NAME}, ${HOTEL_LOCATION.locality}.`,
    startDate: event.eventDate.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.eventImage || siteUrl("/logo.png"),
    url: siteUrl(`/events/${event.id}`),
    location: {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        addressLocality: HOTEL_LOCATION.locality,
        addressRegion: HOTEL_LOCATION.region,
        addressCountry: HOTEL_LOCATION.country,
      },
    },
    organizer: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: siteUrl("/welcome"),
    },
    performer: {
      "@type": "Organization",
      name: `${BRAND_NAME} Animation Team`,
    },
  };
}
