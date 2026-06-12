import { NextRequest } from "next/server";
import { getThumbnailBatchUrl } from "@/lib/admin/video-thumbnail-backfill";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let adminUid: string;
  try {
    const decoded = await requireAdmin();
    adminUid = decoded.uid;
  } catch (e) {
    const msg = e instanceof Error && e.message === "FORBIDDEN" ? "Forbidden." : "Unauthorized.";
    return apiError(e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401, "FORBIDDEN", msg);
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const secret = process.env.TRANSCODE_BACKFILL_SECRET;
  if (!projectId || !secret) {
    return apiError(
      503,
      "THUMBNAIL_NOT_CONFIGURED",
      "TRANSCODE_BACKFILL_SECRET or FIREBASE_PROJECT_ID is missing on the server.",
    );
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

  try {
    const res = await fetch(getThumbnailBatchUrl(projectId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return apiError(
        res.status >= 400 && res.status < 600 ? res.status : 502,
        "THUMBNAIL_RUN_FAILED",
        typeof data.error === "string" ? data.error : GENERIC_ERROR,
      );
    }

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
  } catch {
    return apiError(502, "THUMBNAIL_RUN_FAILED", GENERIC_ERROR);
  }
}
