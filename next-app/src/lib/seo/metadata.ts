import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bosphorusvibe.com";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
};

export function siteUrl(path = ""): string {
  const base = SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = siteUrl(input.path);
  const title = input.title.includes(BRAND_NAME)
    ? input.title
    : `${input.title} | ${BRAND_NAME}`;
  const image = input.image ?? siteUrl("/logo.png");

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: BRAND_NAME,
      title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [image],
    },
  };
}

export { SITE_URL };
