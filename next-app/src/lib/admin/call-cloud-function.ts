import type { NextRequest } from "next/server";

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

/**
 * Call a HTTPS Cloud Function after admin auth on the Next.js route.
 * Forwards the caller's Firebase ID token so CF can verify admin role
 * (no TRANSCODE_BACKFILL_SECRET required on Vercel).
 */
export async function callCloudFunction(
  name: string,
  request: NextRequest,
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

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      status: 401,
      data: { error: "Authorization header gerekli." },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
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
