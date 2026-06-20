import type { Viewport } from "next";
import { Figtree, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientProvidersLoader } from "@/components/providers/ClientProvidersLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildHotelJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld";
import { buildRootMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <JsonLd
          data={[
            buildOrganizationJsonLd(),
            buildHotelJsonLd(),
            buildWebSiteJsonLd(),
          ]}
        />
      </head>
      <body className={`${outfit.variable} ${figtree.variable} font-body`}>
        <ClientProvidersLoader>{children}</ClientProvidersLoader>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
