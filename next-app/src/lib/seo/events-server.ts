import type { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, type EventDoc } from "@/types";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapEvent(id: string, data: Record<string, unknown>): EventDoc {
  const eventDate = toDate(data.Event_Date);
  const rawSortId = data.id;
  const eventSortId =
    typeof rawSortId === "number"
      ? rawSortId
      : typeof rawSortId === "string" && rawSortId.trim()
        ? Number(rawSortId)
        : Number.NaN;

  return {
    id,
    eventSortId: Number.isFinite(eventSortId) ? eventSortId : Number.MAX_SAFE_INTEGER,
    eventName: (data.Event_Name as string) ?? "",
    eventTimeLabel: (data.Event_Time as string) ?? formatTimeLabel(eventDate),
    eventDate,
    eventCategory: (data.Category as string) ?? "",
    eventLocation: (data.Event_Location as string) ?? "",
    eventImage: (data.Event_image as string) ?? "",
    eventDescription: (data.aboutEvent as string) ?? "",
    isHighlight: false,
    view: (data.view as number) ?? 0,
  };
}

export async function listEventsForSeo(limit = 200): Promise<EventDoc[]> {
  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.eventListPortyApp)
      .orderBy("Event_Date", "desc")
      .limit(limit)
      .get();

    return snap.docs.map((doc) => mapEvent(doc.id, doc.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getEventForSeo(id: string): Promise<EventDoc | null> {
  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.eventListPortyApp)
      .doc(id)
      .get();

    if (!snap.exists) return null;
    return mapEvent(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}
