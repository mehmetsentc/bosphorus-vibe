import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { ASSIGNABLE_ROLES } from "@/lib/utils/roles";
import { COLLECTIONS } from "@/types";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const userRoleSchema = z.object({
  role: z.enum([...ASSIGNABLE_ROLES, "Porty Club Animation Team"] as [string, ...string[]]),
});

/** PATCH /api/admin/users/[id] — update user role */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { id: userId } = await context.params;

  if (!userId || userId.length > 128) {
    return apiError(400, "INVALID_ID", "Invalid user id.");
  }

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) return apiError(429, "RATE_LIMIT", "Too many requests.");

  let role: string;
  try {
    const json = await request.json();
    role = userRoleSchema.parse(json).role;
  } catch {
    return apiError(400, "INVALID_BODY", "Invalid role.");
  }

  try {
    await getAdminDb()
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ role });

    await writeAuditLog("admin_update_user_role", adminUid, { userId, role, ip });
    return apiOk({ ok: true, userId, role });
  } catch {
    return apiError(500, "UPDATE_FAILED", GENERIC_ERROR);
  }
}
