import { Suspense } from "react";
import { LandingPage } from "@/components/onboarding/LandingPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Static shell — auth UI is client-only; avoids per-request serverless invocations. */
export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: "Bosphorus Vibe | Hotel Entertainment Platform",
  description: "Discover events, shows, and unforgettable experiences",
  path: "/welcome",
  keywords: [
    "hotel entertainment",
    "resort events",
    "Bosphorus Vibe",
    "vacation activities",
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
    <Suspense fallback={<WelcomeFallback />}>
      <LandingPage />
    </Suspense>
  );
}
