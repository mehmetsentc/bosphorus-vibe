import type { MetadataRoute } from "next";
import { listEventsForSeo } from "@/lib/seo/events-server";
import { siteUrl } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/welcome", changeFrequency: "daily", priority: 1 },
    { path: "/home", changeFrequency: "daily", priority: 0.95 },
    { path: "/events", changeFrequency: "daily", priority: 0.95 },
    { path: "/reels", changeFrequency: "daily", priority: 0.85 },
    { path: "/team", changeFrequency: "weekly", priority: 0.75 },
    { path: "/members", changeFrequency: "weekly", priority: 0.7 },
    { path: "/brand", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3 },
    { path: "/terms-of-service", changeFrequency: "monthly", priority: 0.3 },
    { path: "/cookie-policy", changeFrequency: "monthly", priority: 0.3 },
  ];

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, changeFrequency, priority }) => ({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const events = await listEventsForSeo(200);
  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: siteUrl(`/events/${event.id}`),
    lastModified: event.eventDate > now ? now : event.eventDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticEntries, ...eventEntries];
}
