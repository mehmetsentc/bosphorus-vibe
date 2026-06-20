import { ImageResponse } from "next/og";
import { BRAND_NAME, HOTEL_NAME } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${BRAND_NAME} — ${HOTEL_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #1a1200 0%, #0a2830 45%, #001820 100%)",
          color: "#f7f6f2",
          fontFamily: "system-ui, sans-serif",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: "9999px",
            background: "rgba(212, 175, 55, 0.15)",
            border: "3px solid #D4AF37",
            marginBottom: 32,
            fontSize: 48,
            fontWeight: 700,
            color: "#D4AF37",
          }}
        >
          BV
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {BRAND_NAME}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#D4AF37",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {HOTEL_NAME}
        </div>
        <div
          style={{
            fontSize: 26,
            opacity: 0.9,
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Etkinlikler · Reels · Günlük Aktiviteler · Side, Antalya
        </div>
      </div>
    ),
    { ...size },
  );
}
