import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/profile",
        "/profile/",
        "/admin",
        "/upload",
        "/favorites",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
