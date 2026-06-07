export type Locale = "en" | "tr" | "ru" | "de" | "pl" | "sq" | "uk" | "ro" | "xk";

const SUPPORTED: Record<string, Locale> = {
  tr: "tr",
  ru: "ru",
  de: "de",
  pl: "pl",
  sq: "sq",
  uk: "uk",
  ro: "ro",
};

/** BCP-47 tags → locale. Default: English. */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const lower = raw.toLowerCase();
    if (lower.endsWith("-xk") || lower === "xk") return "xk";
    if (lower.startsWith("sr") && lower.includes("xk")) return "xk";
    const base = lower.split("-")[0];
    if (base === "sq" && lower.includes("-xk")) return "xk";
    const match = SUPPORTED[base];
    if (match) return match;
  }

  return "en";
}

export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en-GB",
  tr: "tr-TR",
  ru: "ru-RU",
  de: "de-DE",
  pl: "pl-PL",
  sq: "sq-AL",
  uk: "uk-UA",
  ro: "ro-RO",
  xk: "sq-XK",
};
