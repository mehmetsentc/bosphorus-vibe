import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/welcome",
    "/home",
    "/events",
    "/reels",
    "/team",
    "/privacy-policy",
    "/terms-of-service",
    "/cookie-policy",
  ];
  const now = new Date();

  return routes.map((path) => ({
    url: siteUrl(path),
    lastModified: now,
    changeFrequency: path === "/events" ? "daily" : "weekly",
    priority: path === "/welcome" || path === "/home" ? 1 : 0.8,
  }));
}
