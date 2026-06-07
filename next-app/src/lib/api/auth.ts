import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/session/constants";
import type { AppRole } from "@/types";

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });
}

export async function verifySessionCookie(
  session: string,
): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<DecodedIdToken | null> {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return verifySessionCookie(session);
}

export async function getUserRole(uid: string): Promise<AppRole> {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  const role = snap.data()?.role;
  return role === "admin" ? "admin" : "user";
}

export async function requireSession(): Promise<DecodedIdToken> {
  const decoded = await getSessionUser();
  if (!decoded) throw new Error("UNAUTHORIZED");
  return decoded;
}

export async function requireAdmin(): Promise<DecodedIdToken> {
  const decoded = await requireSession();
  const role = await getUserRole(decoded.uid);
  if (role !== "admin") throw new Error("FORBIDDEN");
  return decoded;
}
