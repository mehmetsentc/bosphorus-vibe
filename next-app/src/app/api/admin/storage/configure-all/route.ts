import { NextRequest } from "next/server";
import { callCloudFunction } from "@/lib/admin/call-cloud-function";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";

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

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  } catch {
    // optional
  }

  const syncLimit =
    typeof body.syncLimit === "number" ? Math.min(Math.floor(body.syncLimit), 100) : 50;
  const enqueueLimit =
    typeof body.enqueueLimit === "number"
      ? Math.min(Math.floor(body.enqueueLimit), 500)
      : 100;
  const transcodeLimit =
    typeof body.transcodeLimit === "number"
      ? Math.min(Math.floor(body.transcodeLimit), 15)
      : 5;

  const result = await callCloudFunction(
    "configureAllVideoStorage",
    request,
    adminUid,
    { syncLimit, enqueueLimit, transcodeLimit },
  );

  if (!result.ok) {
    const err = result.data.error;
    const message =
      typeof err === "string"
        ? err === "Unauthorized"
          ? "Cloud Function yetkilendirme hatası."
          : err
        : GENERIC_ERROR;
    return apiError(
      result.status >= 400 && result.status < 600 ? result.status : 502,
      "STORAGE_CONFIGURE_FAILED",
      message,
    );
  }

  const data = result.data;
  await writeAuditLog("admin_storage_configure_all", adminUid, {
    ip,
    syncLimit,
    enqueueLimit,
    transcodeLimit,
    sync: data.sync,
    enqueue: data.enqueue,
    transcode: data.transcode,
  });

  return apiOk({
    sync: data.sync ?? {},
    enqueue: data.enqueue ?? {},
    transcode: data.transcode ?? {},
    hasMore: Boolean(data.hasMore),
  });
}
