import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/types";

/** Serializable cursor when Firestore DocumentSnapshot is unavailable (cache restore). */
export type PostPageCursor =
  | QueryDocumentSnapshot<DocumentData>
  | { timePosted: Date; docId: string };

export function isSnapshotCursor(
  cursor: PostPageCursor,
): cursor is QueryDocumentSnapshot<DocumentData> {
  return typeof (cursor as QueryDocumentSnapshot).data === "function";
}

export function postPageCursorFromPost(post: {
  id: string;
  timePosted: Date;
}): { timePosted: Date; docId: string } {
  return { timePosted: post.timePosted, docId: post.id };
}

/** Restore a Firestore snapshot from cached post id for pagination. */
export async function resolvePostPageCursor(
  cursor: PostPageCursor | null | undefined,
): Promise<QueryDocumentSnapshot<DocumentData> | null> {
  if (!cursor) return null;
  if (isSnapshotCursor(cursor)) return cursor;
  try {
    const snap = await getDoc(
      doc(getFirebaseDb(), COLLECTIONS.userPosts, cursor.docId),
    );
    return snap.exists() ? snap : null;
  } catch {
    return null;
  }
}
