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
import { getFirebaseFunctions } from "@/lib/firebase-functions";
import { getAllEvents } from "@/lib/services/firestore";
import { postNeedsThumbnailRegen } from "@/lib/admin/video-thumbnail-backfill";
import { postNeedsVideoTranscode } from "@/lib/admin/video-transcode";
import { clientApiUrl } from "@/lib/client-api-url";
import { getFirebaseEnv } from "@/lib/firebase/config";
import { httpsCallable } from "firebase/functions";
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

/** Firebase'deki Category alanı için geçerli değerler */
export type FirebaseCategory = "SHOW TIME" | "daily" | "weekly";

export type AdminEventInput = {
  eventName: string;
  eventTimeLabel: string;
  eventDate: string;
  eventCategory: FirebaseCategory;
  eventLocation: string;
  eventImage: string;
  eventDescription: string;
  isHighlight: boolean;
  eventSortId: number;
  eventDays?: number[]; // weekly events only
};

export async function createAdminEventClient(data: AdminEventInput): Promise<string> {
  const docData: Record<string, unknown> = {
    Event_Name: data.eventName.trim(),
    Event_Time: data.eventTimeLabel,
    Event_Date: new Date(data.eventDate),
    Category: data.eventCategory,
    Event_Location: data.eventLocation,
    Event_image: data.eventImage,
    aboutEvent: data.eventDescription,
    isHighlight: data.isHighlight,
    id: data.eventSortId,
    view: 0,
  };
  if (data.eventDays) docData.eventDays = data.eventDays;
  const ref = await addDoc(collection(getFirebaseDb(), COLLECTIONS.eventListPortyApp), docData);
  return ref.id;
}

export async function updateAdminEventClient(
  id: string,
  data: Partial<AdminEventInput>,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (data.eventName) patch.Event_Name = data.eventName.trim();
  if (data.eventDescription !== undefined) patch.aboutEvent = data.eventDescription;
  if (data.eventLocation !== undefined) patch.Event_Location = data.eventLocation;
  if (data.eventTimeLabel !== undefined) patch.Event_Time = data.eventTimeLabel;
  if (data.eventDate) patch.Event_Date = new Date(data.eventDate);
  if (data.eventCategory) patch.Category = data.eventCategory;
  if (data.eventImage !== undefined) patch.Event_image = data.eventImage;
  if (data.isHighlight !== undefined) patch.isHighlight = data.isHighlight;
  if (data.eventSortId !== undefined) patch.id = data.eventSortId;
  if (data.eventDays !== undefined) patch.eventDays = data.eventDays;
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
      if (!needsWork({ ...data, id: docSnap.id })) continue;

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

async function parseAdminResponse(res: Response): Promise<Record<string, unknown>> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof data.message === "string" && data.message
        ? data.message === "Unauthorized" || data.message === "Unauthorized."
          ? "Admin oturumu geçersiz — çıkış yapıp tekrar giriş yapın."
          : data.message
        : typeof data.error === "string" &&
            !/^[A-Z_]+$/.test(data.error) &&
            data.error.length < 200
          ? data.error === "Unauthorized"
            ? "Cloud Function yetkilendirme hatası — çıkış yapıp tekrar giriş yapın."
            : data.error
          : res.status === 503
            ? "Sunucu yapılandırması eksik. Vercel env kontrol edin."
            : res.status === 401 || res.status === 403
              ? "Admin oturumu geçersiz — çıkış yapıp tekrar giriş yapın."
              : "İşlem başarısız";
    throw new Error(message);
  }
  return data;
}

async function postAdminApi(
  path: string,
  idToken: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(clientApiUrl(path), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new Error("Sunucuya bağlanılamadı — sayfayı yenileyip tekrar deneyin");
  }
  return parseAdminResponse(res);
}

async function postAdminCallable(
  name: "adminRunTranscodeBatch" | "adminRunThumbnailBatch" | "adminConfigureAllVideoStorage",
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const fn = httpsCallable(getFirebaseFunctions(), name);
  try {
    const result = await fn(payload);
    return (result.data ?? {}) as Record<string, unknown>;
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (code === "functions/unauthenticated") {
      throw new Error("Giriş gerekli — çıkış yapıp tekrar giriş yapın.");
    }
    if (code === "functions/permission-denied") {
      throw new Error("Admin yetkisi gerekli.");
    }
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "İşlem başarısız";
    throw new Error(message);
  }
}

/** Refresh server session cookie — helps Next.js admin API routes. */
export async function refreshAdminSession(idToken: string): Promise<void> {
  try {
    await fetch(clientApiUrl("/api/auth/session"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // optional — callable / direct CF still work without cookie
  }
}

function cloudFunctionBatchUrl(name: string): string | null {
  const projectId = getFirebaseEnv().NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  return `https://europe-central2-${projectId}.cloudfunctions.net/${name}`;
}

async function postCloudFunctionBatch(
  name: string,
  idToken: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = cloudFunctionBatchUrl(name);
  if (!url) {
    throw new Error("Firebase project ID tanımlı değil.");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Cloud Function'a bağlanılamadı.");
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = data.error;
    throw new Error(
      err === "Unauthorized"
        ? "Cloud Function yetkilendirme hatası — çıkış yapıp tekrar giriş yapın."
        : typeof err === "string"
          ? err
          : "İşlem başarısız",
    );
  }
  return data;
}

function isAuthBatchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes("unauthorized") ||
    m.includes("yetkilendirme") ||
    m.includes("oturum geçersiz")
  );
}

async function runBatchWithFallback(
  apiPath: string,
  httpFunctionName: string,
  callableName: "adminRunTranscodeBatch" | "adminRunThumbnailBatch",
  idToken: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const limit = typeof body.limit === "number" ? body.limit : 15;
  try {
    return await postAdminCallable(callableName, { limit });
  } catch (callableErr) {
    try {
      return await postCloudFunctionBatch(httpFunctionName, idToken, body);
    } catch (httpErr) {
      if (!isAuthBatchError(callableErr) && !isAuthBatchError(httpErr)) {
        throw callableErr;
      }
      return postAdminApi(apiPath, idToken, body);
    }
  }
}

function batchResult(data: Record<string, unknown>) {
  return {
    processed: typeof data.processed === "number" ? data.processed : 0,
    succeeded: typeof data.succeeded === "number" ? data.succeeded : 0,
    failed: typeof data.failed === "number" ? data.failed : 0,
  };
}

export async function enqueueTranscodeViaApi(idToken: string, maxMark = 500) {
  const data = await postAdminApi("/api/admin/transcode/enqueue", idToken, {
    limit: maxMark,
  });
  return {
    scanned: typeof data.scanned === "number" ? data.scanned : 0,
    marked: typeof data.marked === "number" ? data.marked : 0,
    alreadyQueued: typeof data.alreadyQueued === "number" ? data.alreadyQueued : 0,
  };
}

export async function enqueueThumbnailViaApi(idToken: string, maxMark = 500) {
  const data = await postAdminApi("/api/admin/thumbnails/enqueue", idToken, {
    limit: maxMark,
  });
  return {
    scanned: typeof data.scanned === "number" ? data.scanned : 0,
    marked: typeof data.marked === "number" ? data.marked : 0,
    alreadyQueued: typeof data.alreadyQueued === "number" ? data.alreadyQueued : 0,
  };
}

export async function runThumbnailBatchClient(idToken: string, batchLimit = 5) {
  const data = await runBatchWithFallback(
    "/api/admin/thumbnails/run",
    "runVideoThumbnailBatch",
    "adminRunThumbnailBatch",
    idToken,
    { limit: batchLimit },
  );
  return batchResult(data);
}

export async function runTranscodeBatchClient(idToken: string, batchLimit = 5) {
  const data = await runBatchWithFallback(
    "/api/admin/transcode/run",
    "runVideoTranscodeBatch",
    "adminRunTranscodeBatch",
    idToken,
    { limit: batchLimit },
  );
  return batchResult(data);
}

export type StorageConfigureRound = {
  sync: { scanned?: number; synced?: number; skipped?: number };
  enqueue: { scanned?: number; marked?: number; alreadyQueued?: number };
  transcode: { processed?: number; succeeded?: number; failed?: number };
  hasMore: boolean;
};

function parseStorageConfigureRound(data: Record<string, unknown>): StorageConfigureRound {
  return {
    sync: (data.sync as StorageConfigureRound["sync"]) ?? {},
    enqueue: (data.enqueue as StorageConfigureRound["enqueue"]) ?? {},
    transcode: (data.transcode as StorageConfigureRound["transcode"]) ?? {},
    hasMore: Boolean(data.hasMore),
  };
}

async function runConfigureAllWithFallback(
  idToken: string,
  body: Record<string, unknown>,
): Promise<StorageConfigureRound> {
  try {
    const data = await postAdminCallable("adminConfigureAllVideoStorage", body);
    return parseStorageConfigureRound(data);
  } catch (callableErr) {
    try {
      const data = await postCloudFunctionBatch(
        "configureAllVideoStorage",
        idToken,
        body,
      );
      return parseStorageConfigureRound(data);
    } catch (httpErr) {
      if (!isAuthBatchError(callableErr) && !isAuthBatchError(httpErr)) {
        throw callableErr;
      }
      const data = await postAdminApi("/api/admin/storage/configure-all", idToken, body);
      return parseStorageConfigureRound(data);
    }
  }
}

export async function configureAllVideoStorageClient(
  idToken: string,
  options?: {
    syncLimit?: number;
    enqueueLimit?: number;
    transcodeLimit?: number;
  },
): Promise<StorageConfigureRound> {
  return runConfigureAllWithFallback(idToken, {
    syncLimit: options?.syncLimit ?? 50,
    enqueueLimit: options?.enqueueLimit ?? 100,
    transcodeLimit: options?.transcodeLimit ?? 5,
  });
}

/** Otomatik tur — sync + kuyruk + encode; hasMore false olana kadar. */
export async function configureAllVideoStorageUntilDone(
  getIdToken: () => Promise<string>,
  maxRounds = 15,
  onProgress?: (round: number, result: StorageConfigureRound) => void,
): Promise<{ rounds: number; last: StorageConfigureRound }> {
  let round = 0;
  let last: StorageConfigureRound = {
    sync: {},
    enqueue: {},
    transcode: {},
    hasMore: true,
  };

  await refreshAdminSession(await getIdToken());

  while (last.hasMore && round < maxRounds) {
    round += 1;
    const idToken = await getIdToken();
    last = await configureAllVideoStorageClient(idToken, {
      syncLimit: 100,
      enqueueLimit: 500,
      transcodeLimit: 5,
    });
    onProgress?.(round, last);
    if (last.hasMore) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return { rounds: round, last };
}
