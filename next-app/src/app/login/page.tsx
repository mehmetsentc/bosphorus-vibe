"use client";

import { useState } from "react";
import { signInWithGoogle, getAuthErrorCode, mapAuthErrorCode } from "@/lib/services/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { BRAND_NAME } from "@/lib/brand";
import { useT } from "@/components/providers/I18nProvider";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
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
      router.replace("/home");
    } catch (err: unknown) {
      const code = getAuthErrorCode(err);
      if (code === "auth/redirect-started") {
        redirecting = true;
        return;
      }
      console.error("Google sign-in failed:", code, err);
      setError(t(mapAuthErrorCode(code)));
    } finally {
      if (!redirecting) setLoading(false);
    }
  }

  const hotelName = t("metaDescription").split(" — ")[0];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 bg-dark-radial" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-vibe/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <Logo size="lg" showTagline className="mb-6" />

        <p className="text-sm tracking-wide text-muted">{hotelName}</p>
        <p className="mt-1 text-xs text-vibe/80">
          {BRAND_NAME} · {t("loginTagline")}
        </p>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface-card py-4 text-sm font-semibold text-foreground transition hover:border-vibe/40 hover:shadow-vibe-sm disabled:opacity-50"
        >
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
          {loading ? t("loginSigningIn") : t("loginWithGoogle")}
        </button>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
