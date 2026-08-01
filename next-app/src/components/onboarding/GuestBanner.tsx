"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";

const DISMISS_KEY = "bv_guest_banner_dismissed";

export function GuestBanner() {
  const { isGuest } = useAccess();
  const t = useT();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  if (!isGuest || dismissed) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-gold/25 bg-gold/10 px-4 py-2.5 text-center backdrop-blur-md">
      <div className="relative mx-auto flex max-w-3xl items-center justify-center gap-3">
        <p className="text-xs text-foreground sm:text-sm">
          {t("guestBannerText")}{" "}
          <Link
            href="/welcome?reason=guest-limited"
            className="font-semibold text-gold underline-offset-2 hover:underline"
          >
            {t("guestBannerCta")}
          </Link>
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              // ignore
            }
            setDismissed(true);
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}
