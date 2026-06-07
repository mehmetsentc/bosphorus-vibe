import type { Locale } from "@/i18n/detect";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
  de: "Deutsch",
  pl: "Polski",
  sq: "Shqip",
  uk: "Українська",
  ro: "Română",
  xk: "Shqip (XK)",
};

export const LOCALE_STORAGE_KEY = "bv_locale";

export function isValidLocale(value: string): value is Locale {
  return value in LOCALE_LABELS;
}
