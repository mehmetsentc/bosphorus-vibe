"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import { SiSettings } from "@/components/settings/SettingsIcons";

type ProfileMenuProps = {
  onLogout: () => void;
  onUploadReel?: () => void;
};

export function ProfileMenu({ onLogout, onUploadReel }: ProfileMenuProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("menu")}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-foreground hover:bg-surface-overlay"
      >
        <IconMenu size={22} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label={t("close")}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-surface-card p-3 shadow-lg">
            <Link
              href="/profile/settings"
              onClick={() => setOpen(false)}
              className="mb-3 flex w-full items-center gap-3 rounded-xl bg-surface-overlay px-3 py-2.5 text-sm font-semibold transition hover:bg-surface-card"
            >
              <SiSettings size={18} />
              {t("settingsTitle")}
            </Link>
            {onUploadReel && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onUploadReel();
                }}
                className="mb-3 w-full rounded-xl bg-surface-overlay py-2.5 text-sm font-semibold transition hover:bg-surface-card"
              >
                {t("uploadReel")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full rounded-xl border border-border py-2.5 text-sm text-muted transition hover:text-foreground"
            >
              {t("logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
