"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ConfirmationResult } from "firebase/auth";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signInAnonymous,
  startPhoneSignIn,
  confirmPhoneSignIn,
  getAuthErrorCode,
  formatAuthErrorMessage,
} from "@/lib/services/auth";
import { getFirebaseConfigIssues, isFirebaseConfigured } from "@/lib/firebase";
import { setAccessCookie } from "@/lib/session/cookies";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { LandingBackground } from "@/components/onboarding/LandingBackground";

type AuthMethod = "email" | "phone" | "google" | "anonymous";
type EmailMode = "signIn" | "signUp";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

const inputClass =
  "w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-left text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-vibe/50 focus:ring-2 focus:ring-vibe/20 dark:bg-surface-card/90";

const methodTabClass = (active: boolean) =>
  `rounded-lg px-2 py-2 text-xs font-semibold transition sm:text-sm ${
    active
      ? "bg-gold/20 text-foreground"
      : "text-muted hover:text-foreground"
  }`;

export function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const t = useT();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [emailMode, setEmailMode] = useState<EmailMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneConfirmation, setPhoneConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reason = searchParams.get("reason");

  // 1. Firebase config kontrolü
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      const issues = getFirebaseConfigIssues();
      console.error("Firebase config issues:", issues);
      setError(t("authErrorConfig"));
    }
  }, [t]);

  function showAuthError(err: unknown, label: string) {
    const code = getAuthErrorCode(err);
    console.error(`${label}:`, code, err);
    setError(formatAuthErrorMessage(code, t));
  }

  useEffect(() => {
    if (loading) return;
    if (user) {
      setAccessCookie(user.isAnonymous ? "guest" : "auth");
      router.replace("/home");
    }
  }, [user, loading, router]);

  function finishAuth(anonymous = false) {
    setAccessCookie(anonymous ? "guest" : "auth");
    router.replace("/home");
  }

  function switchMethod(method: AuthMethod) {
    setAuthMethod(method);
    setError("");
    if (method !== "phone") {
      setPhoneConfirmation(null);
      setPhoneCode("");
    }
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

    if (emailMode === "signUp") {
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
      if (emailMode === "signIn") {
        await signInWithEmail(trimmedEmail, password);
      } else {
        await signUpWithEmail(trimmedEmail, password, displayName);
      }
      finishAuth();
    } catch (err: unknown) {
      showAuthError(err, "Email auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoneSend(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!phone.trim()) {
      setError(t("authErrorInvalidPhone"));
      setBusy(false);
      return;
    }

    try {
      const confirmation = await startPhoneSignIn(phone, RECAPTCHA_CONTAINER_ID);
      setPhoneConfirmation(confirmation);
    } catch (err: unknown) {
      showAuthError(err, "Phone send code failed");
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneConfirmation) return;

    setBusy(true);
    setError("");

    if (!phoneCode.trim()) {
      setError(t("authErrorInvalidCode"));
      setBusy(false);
      return;
    }

    try {
      await confirmPhoneSignIn(phoneConfirmation, phoneCode);
      finishAuth();
    } catch (err: unknown) {
      showAuthError(err, "Phone verify failed");
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
      showAuthError(err, "Google sign-in failed");
    } finally {
      if (!redirecting) setBusy(false);
    }
  }

  async function handleAnonymous() {
    setBusy(true);
    setError("");
    try {
      await signInAnonymous();
      finishAuth(true);
    } catch (err: unknown) {
      showAuthError(err, "Anonymous sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <LandingBackground />
      <div id={RECAPTCHA_CONTAINER_ID} className="sr-only" aria-hidden />

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

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-card p-1 shadow-sm dark:bg-surface-card/90 sm:grid-cols-4">
            {(
              [
                ["email", "authMethodEmail"],
                ["phone", "authMethodPhone"],
                ["google", "authMethodGoogle"],
                ["anonymous", "authMethodAnonymous"],
              ] as const
            ).map(([method, labelKey]) => (
              <button
                key={method}
                type="button"
                onClick={() => switchMethod(method)}
                className={methodTabClass(authMethod === method)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {authMethod === "email" && (
            <>
              <div className="mt-4 flex rounded-xl border border-border bg-surface-card p-1 shadow-sm dark:bg-surface-card/90">
                <button
                  type="button"
                  onClick={() => { setEmailMode("signIn"); setError(""); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                    emailMode === "signIn"
                      ? "bg-gold/20 text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t("authTabSignIn")}
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailMode("signUp"); setError(""); }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                    emailMode === "signUp"
                      ? "bg-gold/20 text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {t("authTabSignUp")}
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-3 text-left">
                {emailMode === "signUp" && (
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
                    autoComplete={emailMode === "signIn" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </label>
                {emailMode === "signUp" && (
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
                    : emailMode === "signIn"
                      ? t("signInWithEmail")
                      : t("signUpWithEmail")}
                </button>
              </form>
            </>
          )}

          {authMethod === "phone" && (
            <div className="mt-4 text-left">
              {!phoneConfirmation ? (
                <form onSubmit={handlePhoneSend} className="flex flex-col gap-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted">
                      {t("phoneLabel")}
                    </span>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder={t("phoneHint")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-2xl border border-vibe/40 bg-vibe/10 px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe hover:bg-vibe/20 active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? t("loginSigningIn") : t("sendPhoneCode")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePhoneVerify} className="flex flex-col gap-3">
                  <p className="text-sm text-muted">{phone}</p>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted">
                      {t("phoneCodeLabel")}
                    </span>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-2xl border border-vibe/40 bg-vibe/10 px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe hover:bg-vibe/20 active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? t("loginSigningIn") : t("verifyPhoneCode")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setPhoneConfirmation(null);
                      setPhoneCode("");
                      setError("");
                    }}
                    className="text-sm text-vibe underline-offset-2 hover:underline disabled:opacity-60"
                  >
                    {t("phoneChangeNumber")}
                  </button>
                </form>
              )}
            </div>
          )}

          {authMethod === "google" && (
            <div className="mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface-card px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe/40 hover:shadow-vibe-sm active:scale-[0.98] disabled:opacity-60 dark:bg-surface-card/90 dark:shadow-none dark:backdrop-blur-sm"
              >
                <GoogleIcon />
                {busy ? t("loginSigningIn") : t("loginWithGoogle")}
              </button>
            </div>
          )}

          {authMethod === "anonymous" && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted">
                {t("anonymousHint")}
              </p>
              <button
                type="button"
                onClick={handleAnonymous}
                disabled={busy}
                className="rounded-2xl border border-gold/50 bg-gold/15 px-6 py-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-gold hover:bg-gold/25 active:scale-[0.98] disabled:opacity-60 dark:border-gold/40 dark:bg-gold/10 dark:shadow-none dark:backdrop-blur-sm dark:hover:bg-gold/20"
              >
                {busy ? t("loginSigningIn") : t("signInAnonymous")}
              </button>
            </div>
          )}

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
