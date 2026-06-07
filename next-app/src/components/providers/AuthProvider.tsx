"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { completeGoogleRedirectSignIn, getUserDoc } from "@/lib/services/auth";
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
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    const doc = await getUserDoc(user.uid);
    setProfile(doc);
  };

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        await completeGoogleRedirectSignIn();
      } catch (err) {
        console.error("Google redirect sign-in failed:", err);
      }

      if (cancelled) return;

      return onAuthStateChanged(getFirebaseAuth(), async (next) => {
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
          setAccessCookie("auth");
          const doc = await getUserDoc(next.uid);
          setProfile(doc);
        } else {
          if (getAccessCookie() === "auth") {
            clearAccessCookie();
          }
          setProfile(null);
        }
        setLoading(false);
      });
    }

    const unsubscribePromise = initAuth();

    return () => {
      cancelled = true;
      unsubscribePromise.then((unsub) => unsub?.());
    };
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, refreshProfile }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
