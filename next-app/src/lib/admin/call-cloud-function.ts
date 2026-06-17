import type { NextRequest } from "next/server";
import { mintIdTokenForUid } from "@/lib/firebase/mint-id-token";

const CF_REGION = "europe-central2";

export function getFirebaseProjectId(): string | null {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    null
  );
}

export function cloudFunctionUrl(name: string): string | null {
  const projectId = getFirebaseProjectId();
  if (!projectId) return null;
  return `https://${CF_REGION}-${projectId}.cloudfunctions.net/${name}`;
}

async function resolveAuthToken(
  request: NextRequest,
  adminUid: string,
): Promise<string | null> {
  try {
    return await mintIdTokenForUid(adminUid);
  } catch {
    const secret = process.env.TRANSCODE_BACKFILL_SECRET?.trim();
    if (secret) return secret;

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return null;
  }
}

/**
 * Call a HTTPS Cloud Function after admin auth on the Next.js route.
 * Prefers TRANSCODE_BACKFILL_SECRET; otherwise mints a fresh admin ID token.
 */
export async function callCloudFunction(
  name: string,
  request: NextRequest,
  adminUid: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const url = cloudFunctionUrl(name);
  if (!url) {
    return {
      ok: false,
      status: 503,
      data: { error: "FIREBASE_PROJECT_ID tanımlı değil." },
    };
  }

  const token = await resolveAuthToken(request, adminUid);
  if (!token) {
    return {
      ok: false,
      status: 401,
      data: { error: "Authorization gerekli." },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 502,
      data: { error: "Cloud Function'a ulaşılamadı." },
    };
  }
}
