"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import { signInWithGoogle, mapAuthErrorCode } from "@/lib/services/auth";
import { setAccessCookie } from "@/lib/session/cookies";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { LandingBackground } from "@/components/onboarding/LandingBackground";

export function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const t = useT();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const reason = searchParams.get("reason");

  useEffect(() => {
    if (loading) return;
    if (user) {
      setAccessCookie("auth");
      router.replace("/home");
    }
  }, [user, loading, router]);

  async function handleGuest() {
    setAccessCookie("guest");
    router.push("/home");
  }

  async function handleGoogle() {
    setSigningIn(true);
    setError("");
    try {
      await signInWithGoogle();
      setAccessCookie("auth");
      router.replace("/home");
    } catch (err: unknown) {
      const code =
        err instanceof Error && "code" in err
          ? String((err as { code?: string }).code)
          : err instanceof Error
            ? err.message
            : "";
      if (code === "auth/redirect-started") return;
      const key = mapAuthErrorCode(code);
      setError(t(key));
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <LandingBackground />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="w-full max-w-md text-center"
        >
          <Logo size="lg" showTagline className="mx-auto mb-8" />

          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold/90">
            {BRAND_NAME}
          </p>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
            {t("landingIntro")}
          </h1>

          {reason === "auth-required" && (
            <p className="mt-4 rounded-xl border border-gold/30 bg-black/40 px-4 py-3 text-sm text-gold">
              {t("authRequiredHint")}
            </p>
          )}
          {reason === "guest-limited" && (
            <p className="mt-4 rounded-xl border border-vibe/30 bg-black/40 px-4 py-3 text-sm text-vibe">
              {t("guestLimitedHint")}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGuest}
              className="rounded-2xl border border-gold/40 bg-gold/10 px-6 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:border-gold hover:bg-gold/20 active:scale-[0.98]"
            >
              {t("continueAsGuest")}
            </button>
            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogle}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface-card/90 px-6 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:border-vibe/40 hover:shadow-vibe-sm active:scale-[0.98] disabled:opacity-60"
            >
              <GoogleIcon />
              {signingIn ? t("loginSigningIn") : t("loginWithGoogle")}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <p className="mt-8 text-xs leading-relaxed text-muted">
            {t("landingLegalHint")}{" "}
            <Link href="/privacy-policy" className="text-vibe underline-offset-2 hover:underline">
              {t("privacyPolicy")}
            </Link>
            {" · "}
            <Link href="/terms-of-service" className="text-vibe underline-offset-2 hover:underline">
              {t("termsOfService")}
            </Link>
          </p>
        </motion.div>
      </div>

      <LegalFooter className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md" />
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
