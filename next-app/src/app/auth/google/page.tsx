"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  clearGoogleRedirectAttempt,
  completeGoogleRedirectSignIn,
  getAuthErrorCode,
  hasGoogleRedirectAttempt,
  markGoogleRedirectAttempt,
  startGoogleRedirectFlow,
} from "@/lib/services/auth";
import { ensureAuthReady } from "@/lib/firebase";
import { setAccessCookie } from "@/lib/session/cookies";
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
        const auth = await ensureAuthReady();
        const user = await completeGoogleRedirectSignIn();

        if (!active) return;

        if (user) {
          clearGoogleRedirectAttempt();
          setAccessCookie(user.isAnonymous ? "guest" : "auth");
          window.location.replace("/home");
          return;
        }

        await auth.authStateReady();
        const current = auth.currentUser;
        if (current?.providerData.some((p) => p.providerId === "google.com")) {
          clearGoogleRedirectAttempt();
          setAccessCookie("auth");
          window.location.replace("/home");
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
        window.location.replace("/welcome?reason=auth-required");
      } catch (err: unknown) {
        if (!active) return;
        clearGoogleRedirectAttempt();
        const code = getAuthErrorCode(err);
        console.error("Google auth callback failed:", code, err);
        setError(code || "auth/unknown");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      {!error ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-muted">{t("loginSigningIn")}</p>
        </>
      ) : (
        <div className="max-w-sm text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            {t("loginFailed")} ({error})
          </p>
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
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </main>
      }
    >
      <GoogleAuthCallback />
    </Suspense>
  );
}
