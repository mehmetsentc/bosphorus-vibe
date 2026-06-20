import { Suspense } from "react";
import { LandingPage } from "@/components/onboarding/LandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOTEL_NAME } from "@/lib/brand";
import { buildHotelJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Static shell — auth UI is client-only; avoids per-request serverless invocations. */
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: `${HOTEL_NAME} — Etkinlikler & Eğlence`,
  description:
    "Bosphorus Sorgun Hotel misafirleri için günlük aktiviteler, spor programı, akşam şovları ve reels. Side, Antalya otel eğlence platformu.",
  path: "/welcome",
  keywords: [
    "Bosphorus Sorgun etkinlikleri",
    "Side otel aktiviteleri",
    "hotel entertainment platform",
    "resort events Antalya",
  ],
});

function WelcomeFallback() {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "linear-gradient(165deg, color-mix(in srgb, var(--gold) 75%, #1a1200) 0%, color-mix(in srgb, var(--vibe-dark) 85%, #001018) 55%, color-mix(in srgb, var(--vibe) 40%, #000810) 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={140} height={140} className="drop-shadow-lg" />
    </div>
  );
}

export default function WelcomePage() {
  return (
    <>
      <JsonLd data={buildHotelJsonLd()} />
      <Suspense fallback={<WelcomeFallback />}>
        <LandingPage />
      </Suspense>
    </>
  );
}
