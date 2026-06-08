import { Suspense } from "react";
import { LandingPage } from "@/components/onboarding/LandingPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

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

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  );
}
