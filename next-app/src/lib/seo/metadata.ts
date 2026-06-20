import type { Metadata } from "next";
import {
  BRAND_INSTAGRAM,
  BRAND_NAME,
  HOTEL_NAME,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
} from "@/lib/brand";
import { canonicalSiteUrl, getCanonicalSiteUrl } from "@/lib/seo/site-url";

const SITE_URL = getCanonicalSiteUrl();

/** Static fallback; root `opengraph-image.tsx` serves 1200×630 at /opengraph-image */
export const DEFAULT_OG_IMAGE = "/opengraph-image";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

type PageMetaInput = {
  title: string;
  description?: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
  imageAlt?: string;
  ogType?: "website" | "article";
};

export function siteUrl(path = ""): string {
  return canonicalSiteUrl(path);
}

export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function mergeKeywords(extra?: string[]): string[] {
  const merged = [...SEO_DEFAULT_KEYWORDS, ...(extra ?? [])];
  return [...new Set(merged)];
}

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = siteUrl(input.path);
  const description = truncateDescription(
    input.description ?? SEO_DEFAULT_DESCRIPTION,
  );
  const title = input.title.includes(BRAND_NAME)
    ? input.title
    : `${input.title} | ${BRAND_NAME}`;
  const image = input.image ?? siteUrl(DEFAULT_OG_IMAGE);
  const imageAlt = input.imageAlt ?? `${BRAND_NAME} — ${input.title}`;

  return {
    title,
    description,
    keywords: mergeKeywords(input.keywords),
    authors: [{ name: BRAND_NAME, url: siteUrl("/welcome") }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    applicationName: BRAND_NAME,
    alternates: {
      canonical: url,
      languages: {
        "tr-TR": url,
        "en-US": url,
      },
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: input.ogType ?? "website",
      locale: "tr_TR",
      alternateLocale: ["en_US"],
      url,
      siteName: BRAND_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${BRAND_INSTAGRAM.handle}`,
      creator: `@${BRAND_INSTAGRAM.handle}`,
      title,
      description,
      images: [image],
    },
  };
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getCanonicalSiteUrl()),
    title: {
      default: `${BRAND_NAME} | ${HOTEL_NAME} — Etkinlikler & Eğlence`,
      template: `%s | ${BRAND_NAME}`,
    },
    description: truncateDescription(SEO_DEFAULT_DESCRIPTION),
    keywords: [...SEO_DEFAULT_KEYWORDS],
    authors: [{ name: BRAND_NAME, url: siteUrl("/welcome") }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    applicationName: BRAND_NAME,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      alternateLocale: ["en_US"],
      url: siteUrl("/welcome"),
      siteName: BRAND_NAME,
      title: BRAND_NAME,
      description: truncateDescription(SEO_DEFAULT_DESCRIPTION),
      images: [
        {
          url: siteUrl(DEFAULT_OG_IMAGE),
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: BRAND_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${BRAND_INSTAGRAM.handle}`,
      creator: `@${BRAND_INSTAGRAM.handle}`,
    },
  };
}

export { SITE_URL };
