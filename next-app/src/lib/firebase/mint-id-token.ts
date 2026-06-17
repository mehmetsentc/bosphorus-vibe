import { getAdminAuth } from "@/lib/firebase/admin";

/**
 * Exchange a Firebase custom token for a fresh ID token (server-side).
 * Used after requireAdmin so Cloud Functions receive a valid Bearer JWT.
 */
export async function mintIdTokenForUid(uid: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY missing");
  }

  const customToken = await getAdminAuth().createCustomToken(uid);

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      cache: "no-store",
    },
  );

  const data = (await res.json().catch(() => ({}))) as {
    idToken?: string;
    error?: { message?: string };
  };

  if (!res.ok || !data.idToken) {
    throw new Error(data.error?.message ?? "ID token exchange failed");
  }

  return data.idToken;
}
