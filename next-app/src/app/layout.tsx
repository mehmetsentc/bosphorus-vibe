import type { Metadata, Viewport } from "next";
import { Figtree, Outfit } from "next/font/google";
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
  ...buildPageMetadata({
    title: "Bosphorus Vibe",
    description:
      "Bosphorus Sorgun Hotel — events, reels, daily activities and entertainment.",
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
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

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
      </body>
    </html>
  );
}
