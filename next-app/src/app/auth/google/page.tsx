"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
import { ensureAuthReady } from "@/lib/firebase";
import { useT } from "@/components/providers/I18nProvider";

function GoogleAuthCallback() {
  const t = useT();
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let active = true;

    void (async () => {
      try {
        await ensureAuthReady();
        const user = await completeGoogleRedirectSignIn();

        if (!active) return;

        if (user) {
          await finalizeGoogleSignIn(user);
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
        if (!active) return;
        clearGoogleRedirectAttempt();
        const code = getAuthErrorCode(err);
        console.error("Google auth callback failed:", code, err);
        setError(formatAuthErrorMessage(code || "loginFailed", t));
      }
    })();

    return () => {
      active = false;
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
