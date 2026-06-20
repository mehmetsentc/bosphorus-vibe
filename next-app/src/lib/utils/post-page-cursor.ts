import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

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
