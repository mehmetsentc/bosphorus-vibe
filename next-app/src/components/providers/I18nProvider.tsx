"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { detectLocale, LOCALE_BCP47, type Locale } from "@/i18n/detect";
import { LOCALE_STORAGE_KEY, isValidLocale } from "@/i18n/locale-labels";
import { getMessage, type MessageKey } from "@/i18n/messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string>) => string;
  dateLocale: string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      setLocaleState(stored);
      return;
    }
    setLocaleState(detectLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_BCP47[locale].split("-")[0];
  }, [locale]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string>) =>
      getMessage(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dateLocale: LOCALE_BCP47[locale],
    }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Safe during static prerender when ClientProviders is client-only. */
export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return (key: MessageKey, vars?: Record<string, string>) =>
      getMessage("en", key, vars);
  }
  return ctx.t;
}
