import type { Metadata, Viewport } from "next";
import { Figtree, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientProvidersLoader } from "@/components/providers/ClientProvidersLoader";
import { buildPageMetadata } from "@/lib/seo/metadata";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bosphorusvibe.com",
  ),
  ...buildPageMetadata({
    title: "Bosphorus Vibe",
    description:
      "Entertainment & event platform — events, reels, daily activities and hotel entertainment.",
    path: "/",
    keywords: [
      "hotel entertainment",
      "vacation activities",
      "Bosphorus Sorgun",
      "resort events",
    ],
  }),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

/** Avoid static prerender export failures for Firebase-heavy client providers. */
export const dynamic = "force-dynamic";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${figtree.variable} font-body`}>
        <ClientProvidersLoader>{children}</ClientProvidersLoader>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
