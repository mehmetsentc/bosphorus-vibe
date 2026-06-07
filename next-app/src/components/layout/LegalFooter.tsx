"use client";

import Link from "next/link";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { useT } from "@/components/providers/I18nProvider";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className = "" }: LegalFooterProps) {
  const t = useT();
  const { openSettings } = useCookieConsent();

  return (
    <footer
      className={`px-4 py-4 text-center text-xs text-muted ${className}`}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/privacy-policy" className="hover:text-foreground">
          {t("privacyPolicy")}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/terms-of-service" className="hover:text-foreground">
          {t("termsOfService")}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/cookie-policy" className="hover:text-foreground">
          {t("cookiePolicy")}
        </Link>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={openSettings}
          className="hover:text-foreground"
        >
          {t("cookieSettings")}
        </button>
      </nav>
    </footer>
  );
}
