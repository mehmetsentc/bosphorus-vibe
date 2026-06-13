"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/components/providers/I18nProvider";
import {
  dismissWorldCupPopup,
  getActiveWorldCupPopup,
  getIstanbulDateKey,
  isWorldCupPopupDismissed,
  type WorldCupPopupDay,
} from "@/lib/events/world-cup-popup";

export function WorldCupDailyPopup() {
  const t = useT();
  const [popup, setPopup] = useState<WorldCupPopupDay | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const active = getActiveWorldCupPopup();
    if (!active) return;

    const dateKey = getIstanbulDateKey();
    if (isWorldCupPopupDismissed(dateKey)) return;

    setPopup(active);
    setOpen(true);
  }, []);

  function handleClose() {
    if (popup) dismissWorldCupPopup(popup.date);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && popup && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-[90] flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-xl font-light text-white shadow-lg ring-2 ring-white/25 backdrop-blur-md"
            aria-label={t("close")}
          >
            ✕
          </button>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={popup.alt}
            className="relative max-h-[min(88dvh,820px)] w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popup.imageSrc}
              alt={popup.alt}
              className="h-full w-full object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
