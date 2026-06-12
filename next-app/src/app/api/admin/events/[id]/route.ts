import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { sanitizeText } from "@/lib/security/sanitize";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { adminEventPatchSchema } from "@/lib/validation/schemas";
import { COLLECTIONS } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { id: eventId } = await context.params;

  if (!eventId || eventId.length > 128) {
    return apiError(400, "INVALID_ID", "Invalid event id.");
  }

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch (e) {
    return apiError(
      e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401,
      "FORBIDDEN",
      "Admin access required.",
    );
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  let patch: Record<string, string>;
  try {
    const json = await request.json();
    const parsed = adminEventPatchSchema.parse(json);
    patch = {};
    if (parsed.eventName) patch.Event_Name = sanitizeText(parsed.eventName, 200);
    if (parsed.eventDescription)
      patch.Event_Description = sanitizeText(parsed.eventDescription, 2000);
    if (parsed.eventLocation)
      patch.Event_Location = sanitizeText(parsed.eventLocation, 300);
  } catch {
    return apiError(400, "INVALID_BODY", "Invalid request.");
  }

  if (Object.keys(patch).length === 0) {
    return apiError(400, "EMPTY_PATCH", "No valid fields to update.");
  }

  try {
    await getAdminDb()
      .collection(COLLECTIONS.eventListPortyApp)
      .doc(eventId)
      .update(patch);
    await writeAuditLog("admin_update_event", adminUid, { eventId, ip });
    return apiOk({ ok: true, eventId });
  } catch {
    return apiError(500, "UPDATE_FAILED", GENERIC_ERROR);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { id: eventId } = await context.params;

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  try {
    await getAdminDb()
      .collection(COLLECTIONS.eventListPortyApp)
      .doc(eventId)
      .delete();
    await writeAuditLog("admin_update_event", adminUid, { eventId, action: "delete", ip });
    return apiOk({ ok: true, eventId });
  } catch {
    return apiError(500, "DELETE_FAILED", GENERIC_ERROR);
  }
}
