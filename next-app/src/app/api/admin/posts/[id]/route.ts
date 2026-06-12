import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { COLLECTIONS } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { id: postId } = await context.params;

  if (!postId || postId.length > 128) {
    return apiError(400, "INVALID_ID", "Invalid post id.");
  }

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch (e) {
    const msg = e instanceof Error && e.message === "FORBIDDEN" ? "Forbidden." : "Unauthorized.";
    return apiError(e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401, "FORBIDDEN", msg);
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  try {
    await getAdminDb().collection(COLLECTIONS.userPosts).doc(postId).delete();
    await writeAuditLog("admin_delete_post", adminUid, { postId, ip });
    return apiOk({ ok: true, postId });
  } catch {
    return apiError(500, "DELETE_FAILED", GENERIC_ERROR);
  }
}
