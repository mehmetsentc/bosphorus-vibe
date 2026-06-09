"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { GuestAuthModal } from "@/components/onboarding/GuestAuthModal";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SettingsProvider>
          <CookieConsentProvider>
            <NavigationProvider>
              <AuthProvider>
                {children}
                <GuestAuthModal />
              </AuthProvider>
            </NavigationProvider>
          </CookieConsentProvider>
        </SettingsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
