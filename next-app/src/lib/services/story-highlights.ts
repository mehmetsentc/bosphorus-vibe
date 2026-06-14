import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { compressImage } from "@/lib/utils/media-compress";
import { prepareStoryImageFile } from "@/lib/utils/story-media";
import { getFirebaseDb } from "@/lib/firebase";
import { refToId, toDate } from "@/lib/utils/firestore-helpers";
import { COLLECTIONS, type StoryHighlightDoc } from "@/types";
import { uploadBlob } from "@/lib/services/firestore";

function mapHighlight(id: string, data: Record<string, unknown>): StoryHighlightDoc {
  return {
    id,
    userId: refToId(data.user) ?? "",
    title: (data.title as string) ?? "",
    coverUrl: (data.coverUrl as string) ?? "",
    storyIds: Array.isArray(data.storyIds)
      ? (data.storyIds as string[]).filter(Boolean)
      : [],
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: toDate(data.createdAt),
  };
}

export async function listStoryHighlights(userId: string): Promise<StoryHighlightDoc[]> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.storyHighlights),
      where("user", "==", userRef),
      orderBy("sortOrder", "asc"),
    ),
  );
  return snap.docs.map((d) => mapHighlight(d.id, d.data()));
}

export async function uploadHighlightCover(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(5);
  const prepared = await prepareStoryImageFile(file);
  onProgress?.(15);
  const blob = await compressImage(prepared);
  const stamp = Date.now();
  const url = await uploadBlob(
    blob,
    `users/${userId}/highlights/cover_${stamp}.jpg`,
    (p) => onProgress?.(15 + Math.round(p * 0.85)),
  );
  onProgress?.(100);
  return url;
}

export async function createStoryHighlight(input: {
  userId: string;
  title: string;
  coverUrl: string;
  storyIds: string[];
  sortOrder?: number;
}): Promise<string> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, input.userId);
  const existing = await listStoryHighlights(input.userId);
  const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.storyHighlights), {
    user: userRef,
    title: input.title.trim().slice(0, 32),
    coverUrl: input.coverUrl,
    storyIds: input.storyIds,
    sortOrder: input.sortOrder ?? existing.length,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateStoryHighlight(
  highlightId: string,
  userId: string,
  patch: Partial<Pick<StoryHighlightDoc, "title" | "coverUrl" | "storyIds" | "sortOrder">>,
): Promise<void> {
  const ref = doc(getFirebaseDb(), COLLECTIONS.storyHighlights, highlightId);
  const snap = await getDoc(ref);
  if (!snap.exists() || refToId(snap.data().user) !== userId) {
    throw new Error("Forbidden");
  }

  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title.trim().slice(0, 32);
  if (patch.coverUrl !== undefined) payload.coverUrl = patch.coverUrl;
  if (patch.storyIds !== undefined) payload.storyIds = patch.storyIds;
  if (patch.sortOrder !== undefined) payload.sortOrder = patch.sortOrder;
  if (!Object.keys(payload).length) return;
  await updateDoc(ref, payload);
}

export async function deleteStoryHighlight(
  highlightId: string,
  userId: string,
): Promise<void> {
  const ref = doc(getFirebaseDb(), COLLECTIONS.storyHighlights, highlightId);
  const snap = await getDoc(ref);
  if (!snap.exists() || refToId(snap.data().user) !== userId) {
    throw new Error("Forbidden");
  }
  await deleteDoc(ref);
}
