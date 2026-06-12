"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getAllEvents } from "@/lib/services/firestore";
import { postNeedsThumbnailRegen } from "@/lib/admin/video-thumbnail-backfill";
import { postNeedsVideoTranscode } from "@/lib/admin/video-transcode";
import { COLLECTIONS } from "@/types";

const PAGE_SIZE = 100;

export type AdminUserRow = {
  uid: string;
  display_name: string;
  userName: string;
  email: string;
  photo_url: string;
  role: string;
  created_time: string | null;
};

export type AdminEventRow = {
  id: string;
  eventName: string;
  eventDate: string | null;
  eventCategory: string;
  eventLocation: string;
  eventDescription: string;
  eventTimeLabel: string;
  eventImage: string;
  isHighlight: boolean;
  eventSortId: number;
  view: number;
};

function mapUserDoc(d: QueryDocumentSnapshot): AdminUserRow {
  const data = d.data();
  const created = data.created_time;
  return {
    uid: d.id,
    display_name: (data.display_name as string) ?? "",
    userName: (data.userName as string) ?? "",
    email: (data.email as string) ?? "",
    photo_url: (data.photo_url as string) ?? "",
    role: (data.role as string) ?? "user",
    created_time:
      created && typeof created.toDate === "function"
        ? created.toDate().toISOString()
        : null,
  };
}

export async function fetchAdminUsersClient(): Promise<AdminUserRow[]> {
  const db = getFirebaseDb();
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.users), orderBy("created_time", "desc"), limit(200)),
    );
    return snap.docs.map(mapUserDoc);
  } catch {
    const snap = await getDocs(query(collection(db, COLLECTIONS.users), limit(200)));
    return snap.docs.map(mapUserDoc);
  }
}

export async function updateUserRoleClient(uid: string, role: "user" | "admin"): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid), { role });
}

export async function fetchAdminEventsClient(): Promise<AdminEventRow[]> {
  const events = await getAllEvents();
  return events
    .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
    .map((e) => ({
      id: e.id,
      eventName: e.eventName,
      eventDate: e.eventDate.toISOString(),
      eventCategory: e.eventCategory,
      eventLocation: e.eventLocation,
      eventDescription: e.eventDescription,
      eventTimeLabel: e.eventTimeLabel,
      eventImage: e.eventImage,
      isHighlight: e.isHighlight,
      eventSortId: e.eventSortId,
      view: e.view,
    }));
}

function categoryToFirestore(category: "show" | "sports"): string {
  return category === "show" ? "show time" : "Sports";
}

export type AdminEventInput = {
  eventName: string;
  eventTimeLabel: string;
  eventDate: string;
  eventCategory: "show" | "sports";
  eventLocation: string;
  eventImage: string;
  eventDescription: string;
  isHighlight: boolean;
  eventSortId: number;
};

export async function createAdminEventClient(data: AdminEventInput): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTIONS.eventListPortyApp), {
    Event_Name: data.eventName.trim(),
    Event_Time: data.eventTimeLabel,
    Event_Date: new Date(data.eventDate),
    Category: categoryToFirestore(data.eventCategory),
    Event_Location: data.eventLocation,
    Event_image: data.eventImage,
    aboutEvent: data.eventDescription,
    isHighlight: data.isHighlight,
    id: data.eventSortId,
    view: 0,
  });
  return ref.id;
}

export async function updateAdminEventClient(
  id: string,
  data: Partial<Pick<AdminEventInput, "eventName" | "eventDescription" | "eventLocation">>,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.eventName) patch.Event_Name = data.eventName.trim();
  if (data.eventDescription !== undefined) patch.aboutEvent = data.eventDescription;
  if (data.eventLocation !== undefined) patch.Event_Location = data.eventLocation;
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.eventListPortyApp, id), patch);
}

export async function deleteAdminEventClient(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COLLECTIONS.eventListPortyApp, id));
}

export async function fetchAdminStatsClient(): Promise<{
  users: number;
  posts: number;
  events: number;
}> {
  const db = getFirebaseDb();
  const [usersSnap, postsSnap, eventsSnap] = await Promise.all([
    getCountFromServer(collection(db, COLLECTIONS.users)),
    getCountFromServer(collection(db, COLLECTIONS.userPosts)),
    getCountFromServer(collection(db, COLLECTIONS.eventListPortyApp)),
  ]);
  return {
    users: usersSnap.data().count,
    posts: postsSnap.data().count,
    events: eventsSnap.data().count,
  };
}

async function enqueuePostsClient(
  needsWork: (data: Record<string, unknown>) => boolean,
  statusField: "videoThumbnailStatus" | "videoTranscodeStatus",
  updatedAtField: "videoThumbnailUpdatedAt" | "videoTranscodeUpdatedAt",
  maxMark: number,
): Promise<{ scanned: number; marked: number; alreadyQueued: number }> {
  const db = getFirebaseDb();
  let lastDoc: DocumentSnapshot | undefined;
  let scanned = 0;
  let marked = 0;
  let alreadyQueued = 0;

  while (marked < maxMark) {
    let q = query(
      collection(db, COLLECTIONS.userPosts),
      orderBy(documentId()),
      limit(PAGE_SIZE),
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snap = await getDocs(q);
    if (snap.empty) break;

    const batch = writeBatch(db);
    let batchWrites = 0;

    for (const docSnap of snap.docs) {
      scanned += 1;
      const data = docSnap.data() as Record<string, unknown>;
      if (!needsWork(data)) continue;

      const status = data[statusField] as string | undefined;
      if (status === "pending" || status === "processing") {
        alreadyQueued += 1;
        continue;
      }

      batch.update(docSnap.ref, {
        [statusField]: "pending",
        [updatedAtField]: new Date(),
      });
      marked += 1;
      batchWrites += 1;

      if (marked >= maxMark) break;
    }

    if (batchWrites > 0) await batch.commit();

    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < PAGE_SIZE) break;
  }

  return { scanned, marked, alreadyQueued };
}

export function enqueueThumbnailRegenClient(maxMark = 500) {
  return enqueuePostsClient(
    postNeedsThumbnailRegen,
    "videoThumbnailStatus",
    "videoThumbnailUpdatedAt",
    maxMark,
  );
}

export function enqueueTranscodeClient(maxMark = 500) {
  return enqueuePostsClient(
    postNeedsVideoTranscode,
    "videoTranscodeStatus",
    "videoTranscodeUpdatedAt",
    maxMark,
  );
}

async function runCloudBatch(
  functionName: "runVideoThumbnailBatch" | "runVideoTranscodeBatch",
  idToken: string,
  batchLimit: number,
): Promise<{ processed: number; succeeded: number; failed: number }> {
  let res: Response;
  try {
    res = await fetch(`/api/admin/functions/${functionName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ limit: batchLimit }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Sunucuya bağlanılamadı — sayfayı yenileyip tekrar deneyin");
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "İşlem başarısız";
    throw new Error(message);
  }

  return {
    processed: typeof data.processed === "number" ? data.processed : 0,
    succeeded: typeof data.succeeded === "number" ? data.succeeded : 0,
    failed: typeof data.failed === "number" ? data.failed : 0,
  };
}

export async function runThumbnailBatchClient(idToken: string, batchLimit = 5) {
  return runCloudBatch("runVideoThumbnailBatch", idToken, batchLimit);
}

export async function runTranscodeBatchClient(idToken: string, batchLimit = 3) {
  return runCloudBatch("runVideoTranscodeBatch", idToken, batchLimit);
}
