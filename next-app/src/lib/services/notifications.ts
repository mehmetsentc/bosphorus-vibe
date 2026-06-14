import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { refToId, toDate } from "@/lib/utils/firestore-helpers";
import { COLLECTIONS, type NotificationDoc, type NotificationType } from "@/types";

const NOTIFICATION_PAGE_SIZE = 50;

function userRef(uid: string) {
  return doc(getFirebaseDb(), COLLECTIONS.users, uid);
}

async function getUserDisplayName(uid: string): Promise<string> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return "user";
  const data = snap.data();
  return (
    (data.display_name as string) ||
    (data.userName as string) ||
    "user"
  );
}

function mapNotification(
  id: string,
  data: Record<string, unknown>,
): NotificationDoc {
  return {
    id,
    is_read: Boolean(data.is_read),
    notification_text: (data.notification_text as string) ?? "",
    type: (data.type as string) ?? "",
    time: toDate(data.time),
    made_by_id: (data.made_by_id as string) ?? refToId(data.made_by) ?? undefined,
    made_to_id: (data.made_to_id as string) ?? refToId(data.made_to) ?? undefined,
    post_id: refToId(data.post_ref) ?? undefined,
    comment_id: refToId(data.comment_ref) ?? undefined,
    chat_id: (data.chat_id as string) ?? undefined,
    actor_name: (data.actor_name as string) ?? undefined,
    actor_photo: (data.actor_photo as string) ?? undefined,
  };
}

export async function createUserNotification(input: {
  type: NotificationType;
  recipientUid: string;
  actorUid: string;
  postId?: string;
  commentId?: string;
  chatId?: string;
  notificationText: string;
  actorName?: string;
  actorPhoto?: string;
}): Promise<void> {
  const {
    type,
    recipientUid,
    actorUid,
    postId,
    commentId,
    chatId,
    notificationText,
  } = input;

  if (!recipientUid || recipientUid === actorUid) return;

  const db = getFirebaseDb();
  let actorName = input.actorName;
  let actorPhoto = input.actorPhoto;
  if (!actorName) {
    const snap = await getDoc(userRef(actorUid));
    if (snap.exists()) {
      const data = snap.data();
      actorName =
        (data.display_name as string) ||
        (data.userName as string) ||
        "user";
      actorPhoto = (data.photo_url as string) ?? "";
    } else {
      actorName = "user";
    }
  }

  const payload: Record<string, unknown> = {
    is_read: false,
    type,
    time: serverTimestamp(),
    notification_text: notificationText,
    made_by: userRef(actorUid),
    made_to: userRef(recipientUid),
    made_by_id: actorUid,
    made_to_id: recipientUid,
    actor_name: actorName,
    actor_photo: actorPhoto ?? "",
  };

  if (postId) {
    payload.post_ref = doc(db, COLLECTIONS.userPosts, postId);
  }
  if (commentId) {
    payload.comment_ref = doc(db, COLLECTIONS.postComments, commentId);
  }
  if (chatId) {
    payload.chat_id = chatId;
  }

  await addDoc(collection(db, COLLECTIONS.notification), payload);
}

/** Fire-and-forget wrapper — never blocks UI on notification errors. */
export function queueUserNotification(
  input: Parameters<typeof createUserNotification>[0],
): void {
  void createUserNotification(input).catch(() => {});
}

export async function notifyPostLike(
  postId: string,
  actorUid: string,
  actorName?: string,
): Promise<void> {
  const db = getFirebaseDb();
  const postSnap = await getDoc(doc(db, COLLECTIONS.userPosts, postId));
  if (!postSnap.exists()) return;
  const ownerId = refToId(postSnap.data().postUser);
  if (!ownerId) return;
  const name = actorName ?? (await getUserDisplayName(actorUid));
  queueUserNotification({
    type: "like",
    recipientUid: ownerId,
    actorUid,
    actorName: name,
    postId,
    notificationText: `${name} liked your post`,
  });
}

export async function notifyPostComment(
  postId: string,
  actorUid: string,
  commentId: string,
  actorName?: string,
): Promise<void> {
  const db = getFirebaseDb();
  const postSnap = await getDoc(doc(db, COLLECTIONS.userPosts, postId));
  if (!postSnap.exists()) return;
  const ownerId = refToId(postSnap.data().postUser);
  if (!ownerId) return;
  const name = actorName ?? (await getUserDisplayName(actorUid));
  queueUserNotification({
    type: "comment",
    recipientUid: ownerId,
    actorUid,
    actorName: name,
    postId,
    commentId,
    notificationText: `${name} commented on your post`,
  });
}

export function notifyPostRepost(
  sourceOwnerId: string,
  actorUid: string,
  sourcePostId: string,
  actorName?: string,
): void {
  void (async () => {
    const name = actorName ?? (await getUserDisplayName(actorUid));
    queueUserNotification({
      type: "repost",
      recipientUid: sourceOwnerId,
      actorUid,
      actorName: name,
      postId: sourcePostId,
      notificationText: `${name} reposted your post`,
    });
  })();
}

export async function notifyChatMessage(
  chatId: string,
  senderUid: string,
  preview: string,
): Promise<void> {
  const db = getFirebaseDb();
  const chatSnap = await getDoc(doc(db, COLLECTIONS.chats, chatId));
  if (!chatSnap.exists()) return;
  const data = chatSnap.data();
  const participantIds = new Set<string>();
  for (const ref of (data.users as unknown[]) ?? []) {
    const id = refToId(ref);
    if (id) participantIds.add(id);
  }
  const a = refToId(data.user_a);
  const b = refToId(data.user_b);
  if (a) participantIds.add(a);
  if (b) participantIds.add(b);

  const name = await getUserDisplayName(senderUid);
  const text = preview.trim().slice(0, 120);

  for (const uid of participantIds) {
    if (uid === senderUid) continue;
    queueUserNotification({
      type: "message",
      recipientUid: uid,
      actorUid: senderUid,
      actorName: name,
      chatId,
      notificationText: `${name}: ${text}`,
    });
  }
}

export function subscribeNotifications(
  uid: string,
  onData: (items: NotificationDoc[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.notification),
    where("made_to_id", "==", uid),
    orderBy("time", "desc"),
    limit(NOTIFICATION_PAGE_SIZE),
  );

  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => mapNotification(d.id, d.data() as Record<string, unknown>)),
      );
    },
    (err) => onError?.(err),
  );
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.notification, notificationId), {
    is_read: true,
  });
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.notification),
    where("made_to_id", "==", uid),
    where("is_read", "==", false),
    limit(100),
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  for (const d of snap.docs) {
    batch.update(d.ref, { is_read: true });
  }
  await batch.commit();
}

export function notificationHref(n: NotificationDoc): string {
  if (n.type === "message" && n.chat_id) {
    return `/messages/${n.chat_id}`;
  }
  if (n.post_id) {
    return `/post/${n.post_id}`;
  }
  return "/notifications";
}
