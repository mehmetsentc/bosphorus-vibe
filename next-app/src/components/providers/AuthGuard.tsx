"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { getAccessCookie } from "@/lib/session/cookies";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const access = getAccessCookie();
    const allowed = Boolean(user) || access === "guest" || access === "auth";
    if (!allowed) router.replace("/welcome");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Logo size="sm" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
      </div>
    );
  }

  const access = getAccessCookie();
  const allowed = Boolean(user) || access === "guest" || access === "auth";
  if (!allowed) return null;

  return <>{children}</>;
}
