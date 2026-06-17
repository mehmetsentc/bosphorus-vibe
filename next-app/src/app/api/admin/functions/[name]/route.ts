import { NextRequest } from "next/server";
import { callCloudFunction, cloudFunctionUrl } from "@/lib/admin/call-cloud-function";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";

const ALLOWED_FUNCTIONS = new Set([
  "runVideoThumbnailBatch",
  "runVideoTranscodeBatch",
]);

type RouteContext = { params: Promise<{ name: string }> };

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
  if (!ALLOWED_FUNCTIONS.has(name) || !cloudFunctionUrl(name)) {
    return apiError(404, "NOT_FOUND", "Bilinmeyen fonksiyon.");
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const result = await callCloudFunction(name, request, body);

  if (!result.ok) {
    const message =
      typeof result.data.error === "string"
        ? result.data.error === "Unauthorized"
          ? "Cloud Function yetkilendirme hatası — admin hesabınızı kontrol edin."
          : result.data.error
        : GENERIC_ERROR;
    return apiError(
      result.status >= 400 && result.status < 600 ? result.status : 502,
      "FUNCTION_FAILED",
      message,
    );
  }

  return apiOk(result.data);
}
