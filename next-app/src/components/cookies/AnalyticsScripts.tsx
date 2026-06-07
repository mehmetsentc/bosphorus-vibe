"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  readConsentFromStorage,
  type CookieConsent,
} from "@/lib/cookies/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function AnalyticsScripts() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(readConsentFromStorage());

    function onChange(event: Event) {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      setConsent(detail);
    }

    window.addEventListener("bv:consent-change", onChange);
    return () => window.removeEventListener("bv:consent-change", onChange);
  }, []);

  if (!GA_ID || !consent?.analytics) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="bv-gtag" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
