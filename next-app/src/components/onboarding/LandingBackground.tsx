"use client";

import { useEffect, useState } from "react";

const DARK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='24' viewBox='0 0 40 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop stop-color='%230a1628'/%3E%3Cstop offset='.5' stop-color='%231a2744'/%3E%3Cstop offset='1' stop-color='%230d1f33'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='24' fill='url(%23g)'/%3E%3C/svg%3E";

export function LandingBackground() {
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMediaReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Light mode */}
      <div className="absolute inset-0 bg-background dark:hidden" />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, var(--gold) 18%, transparent), transparent), radial-gradient(ellipse 70% 50% at 50% 110%, color-mix(in srgb, var(--vibe) 12%, transparent), transparent), linear-gradient(180deg, #faf9f5 0%, #f7f6f2 45%, #f0efe8 100%)",
        }}
      />

      {/* Dark mode */}
      <div className="absolute inset-0 hidden dark:block">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${DARK_POSTER})`,
            opacity: mediaReady ? 0 : 1,
          }}
        />
        <div
          className={`landing-ken-burns absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            mediaReady ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(135deg, #0a1628 0%, #142238 35%, #1a2f4a 55%, #0d2137 100%)",
          }}
        />
        {mediaReady && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={DARK_POSTER}
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-luxury-hotel-pool-at-sunset-1566/1080p.mp4"
              type="video/mp4"
            />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_55%)]" />
      </div>
    </div>
  );
}
