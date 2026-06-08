"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  getAuthErrorCode,
  mapAuthErrorCode,
  completeGoogleRedirectSignIn,
} from "@/lib/services/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { setAccessCookie } from "@/lib/session/cookies";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { LandingBackground } from "@/components/onboarding/LandingBackground";

type AuthMode = "signIn" | "signUp";

const inputClass =
  "w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-left text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-vibe/50 focus:ring-2 focus:ring-vibe/20 dark:bg-surface-card/90";

export function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const t = useT();
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reason = searchParams.get("reason");

  // 1. Firebase config kontrolü
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError(t("authErrorConfig"));
    }
  }, [t]);

  // 2. Mobil redirect sonrası Google sign-in tamamla
  useEffect(() => {
    completeGoogleRedirectSignIn()
      .then((user) => {
        if (user) {
          finishAuth();
        }
      })
      .catch((err) => {
        const code = getAuthErrorCode(err);
        if (code !== "auth/redirect-started") {
          setError(t(mapAuthErrorCode(code)));
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Kullanıcı zaten giriş yaptıysa yönlendir
  useEffect(() => {
    if (loading) return;
    if (user) {
      setAccessCookie("auth");
      router.replace("/home");
    }
  }, [user, loading, router]);

  function finishAuth() {
    setAccessCookie("auth");
    router.replace("/home");
  }

  async function handleGuest() {
    setAccessCookie("guest");
    router.push("/home");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t("authErrorInvalidEmail"));
      setBusy(false);
      return;
    }

    if (authMode === "signUp") {
      if (password.length < 6) {
        setError(t("authErrorWeakPassword"));
        setBusy(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(t("authPasswordMismatch"));
        setBusy(false);
        return;
      }
    }

    try {
      if (authMode === "signIn") {
        await signInWithEmail(trimmedEmail, password);
      } else {
        await signUpWithEmail(trimmedEmail, password, displayName);
      }
      finishAuth();
    } catch (err: unknown) {
      const code = getAuthErrorCode(err);
      console.error("Email auth failed:", code, err);
      setError(t(mapAuthErrorCode(code)));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError("");
    let redirecting = false;
    try {
      await Promise.race([
        signInWithGoogle(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            const err = new Error("Sign-in timed out");
            (err as Error & { code: string }).code = "auth/timeout";
            reject(err);
          }, 20_000);
        }),
      ]);
      finishAuth();
    } catch (err: unknown) {
      const code = getAuthErrorCode(err);
      if (code === "auth/redirect-started") {
        redirecting = true;
        return;
      }
      console.error("Google sign-in failed:", code, err);
      setError(t(mapAuthErrorCode(code)));
    } finally {
      if (!redirecting) setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
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
            <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-foreground dark:border-gold/30 dark:bg-black/40 dark:text-gold">
              {t("authRequiredHint")}
            </p>
          )}
          {reason === "guest-limited" && (
            <p className="mt-4 rounded-xl border border-vibe/40 bg-vibe/10 px-4 py-3 text-sm text-foreground dark:border-vibe/30 dark:bg-black/40 dark:text-vibe">
              {t("guestLimitedHint")}
            </p>
          )}

          <div className="mt-8 flex rounded-xl border border-border bg-surface-card p-1 shadow-sm dark:bg-surface-card/90">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signIn");
                setError("");
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                authMode === "signIn"
                  ? "bg-gold/20 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("authTabSignIn")}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signUp");
                setError("");
              }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                authMode === "signUp"
                  ? "bg-gold/20 text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("authTabSignUp")}
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-3 text-left">
            {authMode === "signUp" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  {t("displayNameLabel")}
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">
                {t("emailLabel")}
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">
                {t("passwordLabel")}
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  authMode === "signIn" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            {authMode === "signUp" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  {t("confirmPasswordLabel")}
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl border border-vibe/40 bg-vibe/10 px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe hover:bg-vibe/20 active:scale-[0.98] disabled:opacity-60"
            >
              {busy
                ? t("loginSigningIn")
                : authMode === "signIn"
                  ? t("signInWithEmail")
                  : t("signUpWithEmail")}
            </button>
          </form>

          <p className="my-4 text-xs uppercase tracking-widest text-muted">
            {t("authOrDivider")}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGuest}
              disabled={busy}
              className="rounded-2xl border border-gold/50 bg-gold/15 px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-gold hover:bg-gold/25 active:scale-[0.98] disabled:opacity-60 dark:border-gold/40 dark:bg-gold/10 dark:shadow-none dark:backdrop-blur-sm dark:hover:bg-gold/20"
            >
              {t("continueAsGuest")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface-card px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe/40 hover:shadow-vibe-sm active:scale-[0.98] disabled:opacity-60 dark:bg-surface-card/90 dark:shadow-none dark:backdrop-blur-sm"
            >
              <GoogleIcon />
              {busy ? t("loginSigningIn") : t("loginWithGoogle")}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

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

      <LegalFooter className="relative z-10 border-t border-border bg-surface/90 backdrop-blur-md dark:border-white/10 dark:bg-black/40" />
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
