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
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        await completeGoogleRedirectSignIn();
      } catch (err) {
        console.error("Google redirect sign-in failed:", err);
      }

      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (next) => {
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
    })();

    return () => {
      active = false;
      unsubscribe?.();
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
