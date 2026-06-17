import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";

const ALLOWED_FUNCTIONS = new Set([
  "runVideoThumbnailBatch",
  "runVideoTranscodeBatch",
]);

type RouteContext = { params: Promise<{ name: string }> };

function cloudFunctionUrl(name: string): string | null {
  if (!ALLOWED_FUNCTIONS.has(name)) return null;
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return null;
  return `https://europe-central2-${projectId}.cloudfunctions.net/${name}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "FORBIDDEN"
        ? "Admin yetkisi gerekli."
        : "Oturum gerekli.";
    return apiError(
      e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401,
      "FORBIDDEN",
      msg,
    );
  }

  const { name } = await context.params;
  const url = cloudFunctionUrl(name);
  if (!url) {
    return apiError(404, "NOT_FOUND", "Bilinmeyen fonksiyon.");
  }

  const secret = process.env.TRANSCODE_BACKFILL_SECRET?.trim();
  if (!secret) {
    return apiError(
      503,
      "TRANSCODE_NOT_CONFIGURED",
      "TRANSCODE_BACKFILL_SECRET sunucuda tanımlı değil.",
    );
  }

  let body = "{}";
  try {
    body = await request.text();
    if (!body.trim()) body = "{}";
  } catch {
    body = "{}";
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const message =
        typeof data.error === "string" ? data.error : GENERIC_ERROR;
      return apiError(
        res.status >= 400 && res.status < 600 ? res.status : 502,
        "FUNCTION_FAILED",
        message,
      );
    }

    return apiOk(data);
  } catch {
    return apiError(502, "FUNCTION_UNREACHABLE", "Cloud Function'a ulaşılamadı.");
  }
}
