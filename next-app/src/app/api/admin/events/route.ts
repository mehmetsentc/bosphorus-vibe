import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { sanitizeText } from "@/lib/security/sanitize";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { COLLECTIONS } from "@/types";
import { z } from "zod";

const createEventSchema = z.object({
  eventName: z.string().min(1).max(200),
  eventTimeLabel: z.string().max(20).default(""),
  eventDate: z.string(), // ISO string
  eventCategory: z.enum(["show", "sports"]),
  eventLocation: z.string().max(300).default(""),
  eventImage: z.string().url().max(1000).optional().default(""),
  eventDescription: z.string().max(2000).default(""),
  isHighlight: z.boolean().default(false),
  eventSortId: z.number().int().default(0),
});

/** GET /api/admin/events — list all events ordered by date desc */
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.eventListPortyApp)
      .orderBy("Event_Date", "desc")
      .limit(200)
      .get();

    const events = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        eventName: d.Event_Name ?? "",
        eventTimeLabel: d.Event_Time_Label ?? d.eventTimeLabel ?? "",
        eventDate: d.Event_Date?.toDate?.()?.toISOString() ?? null,
        eventCategory: d.Category ?? d.Event_Category ?? d.eventCategory ?? "",
        eventLocation: d.Event_Location ?? "",
        eventImage: d.Event_Image ?? d.eventImage ?? "",
        eventDescription: d.Event_Description ?? "",
        isHighlight: d.isHighlight ?? false,
        eventSortId: d.id ?? d.eventSortId ?? 0,
        view: d.view ?? 0,
        eventDays: d.eventDays ?? null,
      };
    });

    return apiOk({ events });
  } catch {
    return apiError(500, "FETCH_FAILED", GENERIC_ERROR);
  }
}

/** POST /api/admin/events — create new event */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let adminUid: string;
  try {
    const decoded = await requireAdmin(request);
    adminUid = decoded.uid;
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) return apiError(429, "RATE_LIMIT", "Too many requests.");

  let data: z.infer<typeof createEventSchema>;
  try {
    const json = await request.json();
    data = createEventSchema.parse(json);
  } catch {
    return apiError(400, "INVALID_BODY", "Invalid event data.");
  }

  try {
    const db = getAdminDb();
    const ref = db.collection(COLLECTIONS.eventListPortyApp).doc();

    await ref.set({
      Event_Name: sanitizeText(data.eventName, 200),
      Event_Time_Label: data.eventTimeLabel,
      Event_Date: new Date(data.eventDate),
      Event_Category: data.eventCategory,
      Event_Location: sanitizeText(data.eventLocation, 300),
      Event_Image: data.eventImage,
      Event_Description: sanitizeText(data.eventDescription, 2000),
      isHighlight: data.isHighlight,
      id: data.eventSortId,
      view: 0,
    });

    await writeAuditLog("admin_create_event", adminUid, { eventId: ref.id, ip });
    return apiOk({ ok: true, id: ref.id });
  } catch {
    return apiError(500, "CREATE_FAILED", GENERIC_ERROR);
  }
}
