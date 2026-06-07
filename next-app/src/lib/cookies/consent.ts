import {
  CONSENT_COOKIE,
  CONSENT_STORAGE_KEY,
} from "@/lib/session/constants";

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: number;
};

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: 0,
};

const CONSENT_MAX_AGE_DAYS = 365;

function serialize(consent: CookieConsent): string {
  return JSON.stringify(consent);
}

function parse(raw: string | null | undefined): CookieConsent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof data.analytics !== "boolean") return null;
    if (typeof data.marketing !== "boolean") return null;
    return {
      necessary: true,
      analytics: data.analytics,
      marketing: data.marketing,
      updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function readConsentFromStorage(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const fromStorage = parse(localStorage.getItem(CONSENT_STORAGE_KEY));
  if (fromStorage) return fromStorage;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  const encoded = match.split("=")[1];
  try {
    return parse(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

export function saveConsent(consent: Omit<CookieConsent, "necessary" | "updatedAt">): CookieConsent {
  const next: CookieConsent = {
    necessary: true,
    analytics: consent.analytics,
    marketing: consent.marketing,
    updatedAt: Date.now(),
  };

  if (typeof window === "undefined") return next;

  const payload = serialize(next);
  localStorage.setItem(CONSENT_STORAGE_KEY, payload);

  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(payload)}; path=/; max-age=${maxAge}; SameSite=Lax`;

  window.dispatchEvent(new CustomEvent("bv:consent-change", { detail: next }));
  return next;
}

export function acceptAllConsent(): CookieConsent {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectNonEssentialConsent(): CookieConsent {
  return saveConsent({ analytics: false, marketing: false });
}
