"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ensureAuthReady } from "@/lib/firebase";
import { completeGoogleRedirectSignIn, getAuthErrorCode, getUserDoc } from "@/lib/services/auth";
import {
  clearAccessCookie,
  getAccessCookie,
  setAccessCookie,
} from "@/lib/session/cookies";
import type { UserDoc } from "@/types";

type AuthState = {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  authError: string | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  authError: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const doc = await getUserDoc(user.uid);
    setProfile(doc);
  }, [user]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function bootstrap() {
      try {
        const auth = await ensureAuthReady();
        const isAuthCallback =
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/auth/");

        // Dedicated /auth/* routes own the redirect handshake.
        if (!isAuthCallback) {
          try {
            await completeGoogleRedirectSignIn();
          } catch (err) {
            const code = getAuthErrorCode(err);
            console.error("Google redirect sign-in failed:", code, err);
            if (active && code && code !== "auth/redirect-started") {
              setAuthError(code);
            }
          }
        }

        if (!active) return;

        unsubscribe = onAuthStateChanged(auth, async (next) => {
          if (!active) return;
          setUser(next);
          if (next) {
            try {
              const idToken = await next.getIdToken();
              await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
              });
            } catch {
              // Session cookie optional until Admin credentials configured
            }
            setAccessCookie(next.isAnonymous ? "guest" : "auth");
            const doc = await getUserDoc(next.uid);
            if (active) setProfile(doc);
          } else {
            if (getAccessCookie() === "auth") {
              clearAccessCookie();
            }
            if (active) setProfile(null);
          }
          if (active) setLoading(false);
        });
      } catch (err) {
        console.error("Auth bootstrap failed:", err);
        if (active) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, authError, refreshProfile }),
    [user, profile, loading, authError, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
