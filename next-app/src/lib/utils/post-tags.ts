import { doc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { COLLECTIONS, type PostTag } from "@/types";

export function dedupePostTags(tags: PostTag[]): PostTag[] {
  const seen = new Set<string>();
  const result: PostTag[] = [];
  for (const tag of tags) {
    if (!tag.uid || seen.has(tag.uid)) continue;
    seen.add(tag.uid);
    result.push({
      uid: tag.uid,
      userName: tag.userName || tag.displayName || tag.uid,
      displayName: tag.displayName,
    });
  }
  return result;
}

export function buildPostTagFields(tags: PostTag[]) {
  const unique = dedupePostTags(tags);
  const db = getFirebaseDb();
  return {
    tagged_user_ids: unique.map((t) => t.uid),
    tagged_people: unique.map((t) => ({
      uid: t.uid,
      userName: t.userName,
      display_name: t.displayName || t.userName,
    })),
    tagged_users: unique.map((t) => doc(db, COLLECTIONS.users, t.uid)),
  };
}

export function parseTaggedPeople(data: unknown): PostTag[] {
  if (!Array.isArray(data)) return [];
  const result: PostTag[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const uid = (row.uid as string) || "";
    if (!uid) continue;
    result.push({
      uid,
      userName: (row.userName as string) || (row.display_name as string) || uid,
      displayName: (row.display_name as string) || undefined,
    });
  }
  return result;
}
