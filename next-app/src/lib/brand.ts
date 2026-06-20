export const BRAND_NAME = "Bosphorus Vibe";

export const HOTEL_NAME = "Bosphorus Sorgun Hotel";

export const HOTEL_LOCATION = {
  locality: "Side",
  region: "Antalya",
  country: "TR",
  countryName: "Turkey",
  address: "Side, Manavgat, Antalya, Turkey",
} as const;

export const BRAND_INSTAGRAM = {
  handle: "bosphorusvibe",
  displayName: "BosphorusVibe",
  url: "https://www.instagram.com/bosphorusvibe/",
  /** Public stats mirrored from @bosphorusvibe (update manually if needed) */
  followers: 1014,
  following: 1,
} as const;

/** Primary SEO description — TR + EN for local & international search */
export const SEO_DEFAULT_DESCRIPTION =
  "Bosphorus Vibe — Bosphorus Sorgun Hotel'in resmi etkinlik ve eğlence platformu. Günlük aktiviteler, spor programı, akşam şovları, reels ve otel etkinlikleri. Side, Antalya.";

export const SEO_DEFAULT_KEYWORDS = [
  "Bosphorus Vibe",
  "bosphorusvibe",
  "Bosphorus Sorgun Hotel",
  "Bosphorus Sorgun",
  "Side otel etkinlikleri",
  "Antalya otel eğlence",
  "hotel entertainment",
  "resort events",
  "vacation activities",
  "otel etkinlikleri",
  "günlük aktiviteler",
  "hotel reels",
  "Side Antalya hotel",
] as const;

/** Firebase / legacy Porty Club strings → brand name */
export function formatBrandText(text: string): string {
  return text
    .replace(/Porty Club Animation Team/gi, `${BRAND_NAME} Animation Team`)
    .replace(/Porty Club/gi, BRAND_NAME)
    .replace(/\bPorty\b/gi, BRAND_NAME);
}
