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
import { readConsentFromStorage } from "@/lib/cookies/consent";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { CookieSettingsModal } from "@/components/cookies/CookieSettingsModal";
import { AnalyticsScripts } from "@/components/cookies/AnalyticsScripts";

type CookieConsentContextValue = {
  openSettings: () => void;
  hasConsent: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue>({
  openSettings: () => {},
  hasConsent: false,
});

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const stored = readConsentFromStorage();
    setHasConsent(Boolean(stored));
    setBannerVisible(!stored);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    setHasConsent(true);
  }, []);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openSettings, hasConsent }),
    [openSettings, hasConsent],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <AnalyticsScripts />
      <CookieBanner visible={bannerVisible} onDismiss={dismissBanner} />
      <CookieSettingsModal
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setHasConsent(Boolean(readConsentFromStorage()));
          if (readConsentFromStorage()) setBannerVisible(false);
        }}
      />
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
