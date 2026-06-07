"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  readConsentFromStorage,
  saveConsent,
  type CookieConsent,
} from "@/lib/cookies/consent";
import { useT } from "@/components/providers/I18nProvider";

type CookieSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function CookieSettingsModal({ open, onClose, onSaved }: CookieSettingsModalProps) {
  const t = useT();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const current = readConsentFromStorage();
    setAnalytics(current?.analytics ?? false);
    setMarketing(current?.marketing ?? false);
  }, [open]);

  function handleSave() {
    saveConsent({ analytics, marketing });
    onSaved?.();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#121212]/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl"
          >
            <h2 id="cookie-settings-title" className="font-display text-lg font-semibold text-foreground">
              {t("cookieSettingsTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted">{t("cookieSettingsDesc")}</p>

            <div className="mt-6 space-y-4">
              <CategoryRow
                title={t("cookieNecessary")}
                description={t("cookieNecessaryDesc")}
                enabled
                locked
              />
              <CategoryRow
                title={t("cookieAnalytics")}
                description={t("cookieAnalyticsDesc")}
                enabled={analytics}
                onChange={setAnalytics}
              />
              <CategoryRow
                title={t("cookieMarketing")}
                description={t("cookieMarketingDesc")}
                enabled={marketing}
                onChange={setMarketing}
              />
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                {t("close")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"
              >
                {t("savePreferences")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CategoryRow({
  title,
  description,
  enabled,
  locked,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={enabled}
          disabled={locked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span
          className={`h-7 w-12 rounded-full transition ${
            enabled ? "bg-gold" : "bg-white/15"
          } ${locked ? "opacity-70" : ""}`}
        />
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </label>
    </div>
  );
}

export type { CookieConsent };
