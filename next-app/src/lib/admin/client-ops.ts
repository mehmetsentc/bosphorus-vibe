"use client";

import {
  collection,
  doc,
  documentId,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  writeBatch,
  type DocumentSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { postNeedsThumbnailRegen, getThumbnailBatchUrl } from "@/lib/admin/video-thumbnail-backfill";
import { postNeedsVideoTranscode, getTranscodeBatchUrl } from "@/lib/admin/video-transcode";
import { COLLECTIONS } from "@/types";

const PAGE_SIZE = 100;

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
  url: string,
  idToken: string,
  batchLimit: number,
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit: batchLimit }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Batch failed");
  }

  return {
    processed: data.processed ?? 0,
    succeeded: data.succeeded ?? 0,
    failed: data.failed ?? 0,
  };
}

export async function runThumbnailBatchClient(idToken: string, batchLimit = 5) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID missing");
  return runCloudBatch(getThumbnailBatchUrl(projectId), idToken, batchLimit);
}

export async function runTranscodeBatchClient(idToken: string, batchLimit = 3) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID missing");
  return runCloudBatch(getTranscodeBatchUrl(projectId), idToken, batchLimit);
}
