"use client";

import { useCallback } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { ensureAuthReady } from "@/lib/firebase";

async function buildAuthHeaders(
  init: RequestInit,
  firebaseUser?: User | null,
): Promise<Headers> {
  const headers = new Headers(init.headers);
  const user = firebaseUser ?? (await ensureAuthReady()).currentUser;

  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

/** Admin API calls with session cookie + Firebase ID token fallback. */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  firebaseUser?: User | null,
): Promise<Response> {
  const headers = await buildAuthHeaders(init, firebaseUser);

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

/** Binds the signed-in user so admin requests wait for auth before firing. */
export function useAdminFetch() {
  const { user } = useAuth();

  return useCallback(
    (input: RequestInfo | URL, init: RequestInit = {}) =>
      adminFetch(input, init, user),
    [user],
  );
}
