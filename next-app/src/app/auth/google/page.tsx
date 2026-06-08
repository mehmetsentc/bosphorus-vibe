"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ensureAuthReady } from "@/lib/firebase";
import {
  clearGoogleRedirectAttempt,
  completeGoogleRedirectSignIn,
  finalizeGoogleSignIn,
  getAuthErrorCode,
  formatAuthErrorMessage,
  hasGoogleRedirectAttempt,
  markGoogleRedirectAttempt,
  startGoogleRedirectFlow,
} from "@/lib/services/auth";
import { useT } from "@/components/providers/I18nProvider";

function isGoogleUser(user: { providerData: { providerId: string }[] }): boolean {
  return user.providerData.some((p) => p.providerId === "google.com");
}

function GoogleAuthCallback() {
  const t = useT();
  const [error, setError] = useState("");
  const started = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let active = true;
    let unsubscribe: (() => void) | undefined;

    const timeout = window.setTimeout(() => {
      if (!active || finished.current) return;
      clearGoogleRedirectAttempt();
      setError(t("loginFailed"));
    }, 20000);

    function complete(user: Parameters<typeof finalizeGoogleSignIn>[0]) {
      if (finished.current) return;
      finished.current = true;
      finalizeGoogleSignIn(user);
    }

    void (async () => {
      try {
        const auth = await ensureAuthReady();

        unsubscribe = onAuthStateChanged(auth, (current) => {
          if (!active || !current || !isGoogleUser(current)) return;
          complete(current);
        });

        const user = await completeGoogleRedirectSignIn();
        if (!active || finished.current) return;

        if (user) {
          complete(user);
          return;
        }

        if (!hasGoogleRedirectAttempt()) {
          markGoogleRedirectAttempt();
          try {
            await startGoogleRedirectFlow();
          } catch (err: unknown) {
            const code = getAuthErrorCode(err);
            if (code === "auth/redirect-started") return;
            throw err;
          }
          return;
        }

        clearGoogleRedirectAttempt();
        setError(t("loginFailed"));
      } catch (err: unknown) {
        if (!active || finished.current) return;
        clearGoogleRedirectAttempt();
        const code = getAuthErrorCode(err);
        console.error("Google auth callback failed:", code, err);
        setError(formatAuthErrorMessage(code || "loginFailed", t));
      }
    })();

    return () => {
      active = false;
      window.clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [t]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6">
      {!error ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-muted">{t("loginSigningIn")}</p>
        </>
      ) : (
        <div className="max-w-sm text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <a
            href="/welcome"
            className="mt-4 inline-block text-sm text-vibe underline-offset-2 hover:underline"
          >
            {t("resetPasswordBack")}
          </a>
        </div>
      )}
    </main>
  );
}

export default function GoogleAuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </main>
      }
    >
      <GoogleAuthCallback />
    </Suspense>
  );
}
