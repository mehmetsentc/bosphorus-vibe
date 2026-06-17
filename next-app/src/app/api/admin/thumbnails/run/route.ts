import { NextRequest } from "next/server";
import { callCloudFunction } from "@/lib/admin/call-cloud-function";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";

function cfErrorMessage(error: unknown): string {
  if (typeof error !== "string") return GENERIC_ERROR;
  if (error === "Unauthorized") {
    return "Cloud Function yetkilendirme hatası — admin hesabınızı kontrol edin.";
  }
  return error;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "FORBIDDEN"
        ? "Admin yetkisi gerekli."
        : "Oturum geçersiz — çıkış yapıp tekrar giriş yapın.";
    return apiError(
      e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401,
      "FORBIDDEN",
      msg,
    );
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Çok fazla istek. Biraz bekleyin.");
  }

  let limit = 5;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.limit === "number" && body.limit > 0) {
      limit = Math.min(Math.floor(body.limit), 8);
    }
  } catch {
    // optional body
  }

  const result = await callCloudFunction("runVideoThumbnailBatch", request, { limit });

  if (!result.ok) {
    return apiError(
      result.status >= 400 && result.status < 600 ? result.status : 502,
      "THUMBNAIL_RUN_FAILED",
      cfErrorMessage(result.data.error),
    );
  }

  const data = result.data;
  await writeAuditLog("admin_thumbnail_run", adminUid, {
    ip,
    limit,
    processed: data.processed ?? 0,
    succeeded: data.succeeded ?? 0,
    failed: data.failed ?? 0,
  });

  return apiOk({
    processed: data.processed ?? 0,
    succeeded: data.succeeded ?? 0,
    failed: data.failed ?? 0,
  });
}
