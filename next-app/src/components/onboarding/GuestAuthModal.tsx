"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useGuestModal } from "@/lib/hooks/useGuestModal";
import { Logo } from "@/components/brand/Logo";

export function GuestAuthModal() {
  const { open, close } = useGuestModal();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm rounded-t-3xl border border-white/10 bg-surface-card px-6 pb-10 pt-6 shadow-2xl sm:rounded-3xl"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <Logo size="sm" className="opacity-90" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Üye Ol veya Giriş Yap
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                Beğenme, yorum yapma ve diğer etkileşimler için üye olman gerekiyor.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/welcome?reason=auth-required"
                onClick={close}
                className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98] gold-gradient hover:brightness-110"
              >
                Üye Ol
              </Link>
              <Link
                href="/welcome?reason=auth-required"
                onClick={close}
                className="flex w-full items-center justify-center rounded-2xl border border-border bg-surface-raised px-4 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe/30 hover:bg-surface-overlay active:scale-[0.98]"
              >
                Zaten hesabım var — Giriş Yap
              </Link>
              <button
                type="button"
                onClick={close}
                className="mt-1 text-center text-sm text-muted transition hover:text-foreground"
              >
                Şimdi değil
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
