"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import type { AppRole } from "@/types";

export function useRole(): {
  role: AppRole;
  isAdmin: boolean;
} {
  const { profile } = useAuth();
  const role: AppRole = profile?.role === "admin" ? "admin" : "user";
  return { role, isAdmin: role === "admin" };
}
