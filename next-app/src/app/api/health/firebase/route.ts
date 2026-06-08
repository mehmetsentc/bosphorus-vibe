import { NextResponse } from "next/server";
import { getFirebaseConfigIssues, getFirebaseEnv } from "@/lib/firebase/config";

/** Public build-time config check — helps verify Vercel env vars without exposing secrets. */
export async function GET() {
  const env = getFirebaseEnv();
  const issues = getFirebaseConfigIssues();
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return NextResponse.json({
    ok: issues.length === 0,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
    appIdSuffix: env.NEXT_PUBLIC_FIREBASE_APP_ID
      ? env.NEXT_PUBLIC_FIREBASE_APP_ID.slice(-8)
      : null,
    apiKeySet: Boolean(apiKey),
    apiKeySuffix: apiKey ? apiKey.slice(-6) : null,
    issueKeys: issues.map((issue) => issue.key),
  });
}
