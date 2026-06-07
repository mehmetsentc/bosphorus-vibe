"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  acceptAllConsent,
  rejectNonEssentialConsent,
} from "@/lib/cookies/consent";
import { useT } from "@/components/providers/I18nProvider";
import { CookieSettingsModal } from "@/components/cookies/CookieSettingsModal";

type CookieBannerProps = {
  visible: boolean;
  onDismiss: () => void;
};

export function CookieBanner({ visible, onDismiss }: CookieBannerProps) {
  const t = useT();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function acceptAll() {
    acceptAllConsent();
    onDismiss();
  }

  function rejectNonEssential() {
    rejectNonEssentialConsent();
    onDismiss();
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-[#0d0d0d]/90 p-4 shadow-2xl backdrop-blur-xl safe-area-pb sm:p-5"
            aria-label={t("cookieBannerLabel")}
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-foreground/90">
                {t("cookieBannerText")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-white/5 active:scale-[0.98]"
                >
                  {t("managePreferences")}
                </button>
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-muted transition hover:text-foreground active:scale-[0.98]"
                >
                  {t("rejectNonEssential")}
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"
                >
                  {t("acceptAll")}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <CookieSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={onDismiss}
      />
    </>
  );
}
