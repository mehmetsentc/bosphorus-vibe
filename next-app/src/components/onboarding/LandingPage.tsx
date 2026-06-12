"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import {
  signInWithGoogle,
  signInWithGoogleMobile,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  signInAnonymous,
  ensureCanonicalOrigin,
  getAuthErrorCode,
  formatAuthErrorMessage,
} from "@/lib/services/auth";
import { getFirebaseConfigIssues, isFirebaseConfigured } from "@/lib/firebase";
import { setAccessCookie } from "@/lib/session/cookies";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { LegalFooter } from "@/components/layout/LegalFooter";

type AuthView = "onboarding" | "signIn" | "signUp" | "reset";

const inputClass =
  "w-full rounded-2xl border border-border bg-surface-raised/60 px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-vibe/60 focus:ring-2 focus:ring-vibe/15 dark:bg-surface-overlay/40";

const primaryBtnClass =
  "w-full rounded-2xl py-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60 gold-gradient hover:brightness-110";

const outlineBtnClass =
  "flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface-card px-4 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-vibe/30 hover:bg-surface-raised active:scale-[0.98] disabled:opacity-60 dark:bg-surface-card/80";

export function LandingPage() {
  const searchParams = useSearchParams();
  const { user, authError: redirectAuthError } = useAuth();
  const t = useT();

  const reason = searchParams.get("reason");
  const [view, setView] = useState<AuthView>(
    reason ? "signIn" : "onboarding",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    ensureCanonicalOrigin();
  }, []);

  useEffect(() => {
    if (redirectAuthError) {
      setError(formatAuthErrorMessage(redirectAuthError, t));
      setView("signIn");
    }
  }, [redirectAuthError, t]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.error("Firebase config issues:", getFirebaseConfigIssues());
      setError(t("authErrorConfig"));
    }
  }, [t]);

  useEffect(() => {
    // Only redirect authenticated (non-anonymous) users.
    // Anonymous/guest users should stay on the welcome page so they can sign up or sign in.
    if (user && !user.isAnonymous) {
      setAccessCookie("auth");
      window.location.assign("/home");
    }
  }, [user]);

  function showAuthError(err: unknown, label: string) {
    const code = getAuthErrorCode(err);
    console.error(`${label}:`, code, err);
    setError(formatAuthErrorMessage(code, t));
  }

  function switchView(next: AuthView) {
    setView(next);
    setError("");
    setResetSent(false);
  }

  function finishAuth() {
    setAccessCookie("auth");
    window.location.assign("/home");
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

    if (view === "signUp") {
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
      if (view === "signIn") {
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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResetSent(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t("authErrorInvalidEmail"));
      setBusy(false);
      return;
    }

    try {
      await sendPasswordReset(trimmedEmail);
      setResetSent(true);
    } catch (err: unknown) {
      showAuthError(err, "Password reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    setBusy(true);
    setError("");
    try {
      await signInAnonymous();
      window.location.assign("/events");
    } catch (err: unknown) {
      showAuthError(err, "Anonymous sign-in failed");
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (ensureCanonicalOrigin()) return;

    setBusy(true);
    setError("");

    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let redirecting = false;
    try {
      if (mobile) {
        await signInWithGoogleMobile();
      } else {
        await signInWithGoogle();
      }
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

  // Reset stuck loading state when user returns from a cancelled OAuth flow.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        setBusy(false);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const viewTitle =
    view === "onboarding"
      ? t("authGetStarted")
      : view === "signIn"
        ? t("authTabSignIn")
        : view === "signUp"
          ? t("authTabSignUp")
          : t("resetPassword");

  const viewSubtitle =
    view === "onboarding"
      ? t("authOnboardingSubtitle")
      : view === "signIn"
        ? t("authSignInSubtitle")
        : view === "signUp"
          ? t("authSignUpSubtitle")
          : t("authResetSubtitle");

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Hero */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center px-6 pb-6 pt-12 text-center sm:pt-16"
        style={{
          background:
            "linear-gradient(165deg, color-mix(in srgb, var(--gold) 75%, #1a1200) 0%, color-mix(in srgb, var(--vibe-dark) 85%, #001018) 55%, color-mix(in srgb, var(--vibe) 40%, #000810) 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.2),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,122,153,0.25),transparent_55%)]" />

        <motion.div
          initial={false}
          className="relative z-10"
        >
          <Logo size="lg" showTagline className="mx-auto drop-shadow-lg" />
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.35em] text-white/80">
            {BRAND_NAME}
          </p>
          {view === "onboarding" && (
            <h1 className="mx-auto mt-5 max-w-xs font-display text-2xl font-semibold leading-snug text-white sm:max-w-sm sm:text-3xl">
              {t("landingIntro")}
            </h1>
          )}
        </motion.div>
      </div>

      {/* Auth card */}
      <div className="relative z-20 -mt-2 flex shrink-0 flex-col rounded-t-[2rem] bg-surface-card shadow-[0_-12px_48px_rgba(0,0,0,0.12)] dark:bg-surface-card dark:shadow-[0_-12px_48px_rgba(0,0,0,0.45)] sm:mx-auto sm:mb-8 sm:max-w-md sm:rounded-[2rem] sm:shadow-xl">
        <div className="px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
          {view !== "onboarding" && (
            <button
              type="button"
              onClick={() => switchView(view === "reset" ? "signIn" : "onboarding")}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
            >
              <ChevronLeftIcon />
              {t("authBack")}
            </button>
          )}

          {(reason === "auth-required" || reason === "guest-limited") && (
            <p
              className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                reason === "guest-limited"
                  ? "border-vibe/30 bg-vibe/10 text-foreground"
                  : "border-gold/30 bg-gold/10 text-foreground"
              }`}
            >
              {reason === "guest-limited"
                ? t("guestLimitedHint")
                : t("authRequiredHint")}
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === "onboarding" ? 0 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              {view !== "onboarding" && (
                <div className="mb-6 text-left">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {viewTitle}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {viewSubtitle}
                  </p>
                </div>
              )}

              {view === "onboarding" && (
                <div className="text-center">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {t("authGetStarted")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t("authOnboardingSubtitle")}
                  </p>
                  <button
                    type="button"
                    onClick={() => switchView("signIn")}
                    className={`mt-8 ${primaryBtnClass}`}
                    disabled={busy}
                  >
                    {t("authGetStarted")}
                  </button>
                  <button
                    type="button"
                    onClick={handleGuest}
                    disabled={busy}
                    className={`mt-3 ${outlineBtnClass}`}
                  >
                    <GuestIcon />
                    {busy ? t("loginSigningIn") : "Misafir olarak devam et"}
                  </button>
                  <p className="mt-6 text-sm text-muted">
                    {t("authNoAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => switchView("signUp")}
                      className="font-semibold text-vibe underline-offset-2 hover:underline"
                    >
                      {t("authTabSignUp")}
                    </button>
                  </p>
                </div>
              )}

              {view === "reset" && (
                <div>
                  {resetSent ? (
                    <div className="space-y-4">
                      <p className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                        {t("resetPasswordSent")}
                      </p>
                      <button
                        type="button"
                        onClick={() => switchView("signIn")}
                        className={`${outlineBtnClass} w-full`}
                      >
                        {t("resetPasswordBack")}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-muted">
                          {t("emailLabel")}
                        </span>
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder={t("resetPasswordEmailLabel")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={busy}
                        className={primaryBtnClass}
                      >
                        {busy ? t("loginSigningIn") : t("authSendResetLink")}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {(view === "signIn" || view === "signUp") && (
                <div className="space-y-4">
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    {view === "signUp" && (
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
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete={
                            view === "signIn" ? "current-password" : "new-password"
                          }
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputClass} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </label>
                    {view === "signUp" && (
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-muted">
                          {t("confirmPasswordLabel")}
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputClass}
                        />
                      </label>
                    )}
                    {view === "signIn" && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => switchView("reset")}
                          className="text-xs font-medium text-vibe underline-offset-2 hover:underline"
                        >
                          {t("forgotPassword")}
                        </button>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={busy}
                      className={primaryBtnClass}
                    >
                      {busy
                        ? t("loginSigningIn")
                        : view === "signIn"
                          ? t("signInWithEmail")
                          : t("signUpWithEmail")}
                    </button>
                  </form>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted">{t("authOrContinueWith")}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleGoogle}
                    className={outlineBtnClass}
                  >
                    <GoogleIcon />
                    {busy ? t("loginSigningIn") : t("authContinueWithGoogle")}
                  </button>

                  <p className="pt-2 text-center text-sm text-muted">
                    {view === "signIn" ? t("authNoAccount") : t("authHaveAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => switchView(view === "signIn" ? "signUp" : "signIn")}
                      className="font-semibold text-vibe underline-offset-2 hover:underline"
                    >
                      {view === "signIn" ? t("authTabSignUp") : t("authTabSignIn")}
                    </button>
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted">
            {t("landingLegalHint")}{" "}
            <Link
              href="/privacy-policy"
              className="text-vibe underline-offset-2 hover:underline"
            >
              {t("privacyPolicy")}
            </Link>
            {" · "}
            <Link
              href="/terms-of-service"
              className="text-vibe underline-offset-2 hover:underline"
            >
              {t("termsOfService")}
            </Link>
          </p>
        </div>

        <LegalFooter className="rounded-b-[2rem] border-t border-border bg-surface-raised/50 px-6 py-4 dark:bg-surface-overlay/30 sm:rounded-b-[2rem]" />
      </div>
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

function GuestIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}
