"use client";

import { detectLocale, LOCALE_BCP47 } from "@/i18n/detect";
import { getMessage } from "@/i18n/messages";
import { BRAND_NAME } from "@/lib/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = typeof window !== "undefined" ? detectLocale() : "en";
  const lang = LOCALE_BCP47[locale].split("-")[0];

  return (
    <html lang={lang}>
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#D4AF37" }}>
            {BRAND_NAME}
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.6 }}>
            {getMessage(locale, "appStartFailed")}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              borderRadius: "1rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #F0D875, #D4AF37)",
              color: "#000",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {getMessage(locale, "reload")}
          </button>
        </div>
      </body>
    </html>
  );
}
