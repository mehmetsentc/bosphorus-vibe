"use client";

import Link from "next/link";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";

export function GuestBanner() {
  const { isGuest } = useAccess();
  const t = useT();

  if (!isGuest) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-gold/25 bg-gold/10 px-4 py-2.5 text-center backdrop-blur-md">
      <p className="text-xs text-foreground sm:text-sm">
        {t("guestBannerText")}{" "}
        <Link
          href="/welcome?reason=guest-limited"
          className="font-semibold text-gold underline-offset-2 hover:underline"
        >
          {t("guestBannerCta")}
        </Link>
      </p>
    </div>
  );
}
