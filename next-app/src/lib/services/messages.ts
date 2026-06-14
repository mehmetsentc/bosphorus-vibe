import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getUserDoc } from "@/lib/services/auth";
import { isFollowing } from "@/lib/services/friends";
import { refToId, refsToIds, toDate } from "@/lib/utils/firestore-helpers";
import { COLLECTIONS, type ChatDoc, type ChatMessageDoc } from "@/types";

function userRef(uid: string) {
  return doc(getFirebaseDb(), COLLECTIONS.users, uid);
}

function mapChat(id: string, data: Record<string, unknown>): ChatDoc {
  return {
    id,
    userIds: refsToIds(data.users),
    lastMessage: (data.last_message as string) ?? "",
    lastMessageTime: toDate(data.last_message_time),
    lastMessageSeenByIds: refsToIds(data.last_message_seen_by),
    lastMessageSentById: refToId(data.last_message_sent_by),
    groupChatId:
      typeof data.group_chat_id === "number" ? data.group_chat_id : undefined,
    hiddenByIds: refsToIds(data.hidden_by),
    deletedByIds: refsToIds(data.deleted_by),
    spamByIds: refsToIds(data.spam_by),
  };
}

function mapMessage(id: string, data: Record<string, unknown>): ChatMessageDoc {
  return {
    id,
    chatId: refToId(data.chat) ?? "",
    userId: refToId(data.user) ?? refToId(data.owner) ?? "",
    text: (data.text as string) ?? "",
    image: (data.image as string) || undefined,
    video: (data.video as string) || undefined,
    timestamp: toDate(data.timestamp),
  };
}

export type ChatPreview = ChatDoc & {
  otherUserId?: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  unread: boolean;
};

export type ChatInboxFilter = "inbox" | "hidden" | "spam";

export function filterChatsByInbox(
  chats: ChatPreview[],
  currentUid: string,
  filter: ChatInboxFilter,
): ChatPreview[] {
  return chats.filter((chat) => {
    const hidden = chat.hiddenByIds?.includes(currentUid) ?? false;
    const deleted = chat.deletedByIds?.includes(currentUid) ?? false;
    const spam = chat.spamByIds?.includes(currentUid) ?? false;

    if (deleted) return false;

    switch (filter) {
      case "spam":
        return spam;
      case "hidden":
        return hidden && !spam;
      case "inbox":
      default:
        return !hidden && !spam;
    }
  });
}

async function mutateChatUserList(
  chatId: string,
  uid: string,
  field: "hidden_by" | "deleted_by" | "spam_by",
  add: boolean,
): Promise<void> {
  const chatRef = doc(getFirebaseDb(), COLLECTIONS.chats, chatId);
  const meRef = userRef(uid);
  await updateDoc(chatRef, {
    [field]: add ? arrayUnion(meRef) : arrayRemove(meRef),
  });
}

export async function hideChat(chatId: string, uid: string): Promise<void> {
  await mutateChatUserList(chatId, uid, "hidden_by", true);
}

export async function unhideChat(chatId: string, uid: string): Promise<void> {
  await mutateChatUserList(chatId, uid, "hidden_by", false);
}

export async function deleteChatForUser(
  chatId: string,
  uid: string,
): Promise<void> {
  await mutateChatUserList(chatId, uid, "deleted_by", true);
}

export async function markChatAsSpam(chatId: string, uid: string): Promise<void> {
  const chatRef = doc(getFirebaseDb(), COLLECTIONS.chats, chatId);
  const meRef = userRef(uid);
  await updateDoc(chatRef, {
    spam_by: arrayUnion(meRef),
    hidden_by: arrayUnion(meRef),
  });
}

export async function unmarkChatAsSpam(
  chatId: string,
  uid: string,
): Promise<void> {
  await mutateChatUserList(chatId, uid, "spam_by", false);
}

export async function restoreChatToInbox(
  chatId: string,
  uid: string,
): Promise<void> {
  const chatRef = doc(getFirebaseDb(), COLLECTIONS.chats, chatId);
  const meRef = userRef(uid);
  await updateDoc(chatRef, {
    hidden_by: arrayRemove(meRef),
    spam_by: arrayRemove(meRef),
    deleted_by: arrayRemove(meRef),
  });
}

export async function deleteMessage(
  messageId: string,
  uid: string,
): Promise<void> {
  const msgRef = doc(getFirebaseDb(), COLLECTIONS.chatMessages, messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const ownerId =
    refToId(snap.data().owner) ?? refToId(snap.data().user) ?? "";
  if (ownerId !== uid) throw new Error("Forbidden");
  await deleteDoc(msgRef);
}

export async function canRecipientReceiveMessages(
  recipientUid: string,
  senderUid: string,
): Promise<{ allowed: boolean; reason?: "off" | "followers" }> {
  const profile = await getUserDoc(recipientUid);
  const privacy = profile?.allow_messages ?? "everyone";
  if (privacy === "off") return { allowed: false, reason: "off" };
  if (privacy === "followers") {
    const following = await isFollowing(recipientUid, senderUid);
    if (!following) return { allowed: false, reason: "followers" };
  }
  return { allowed: true };
}

export async function getChat(chatId: string): Promise<ChatDoc | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.chats, chatId));
  if (!snap.exists()) return null;
  return mapChat(snap.id, snap.data());
}

export function subscribeChats(
  currentUid: string,
  onData: (chats: ChatDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const meRef = userRef(currentUid);
  const q = query(
    collection(db, COLLECTIONS.chats),
    where("users", "array-contains", meRef),
    orderBy("last_message_time", "desc"),
    limit(50),
  );

  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapChat(d.id, d.data())));
    },
    (err) => onError?.(err),
  );
}

export function subscribeMessages(
  chatId: string,
  onData: (messages: ChatMessageDoc[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb();
  const chatRef = doc(db, COLLECTIONS.chats, chatId);
  const q = query(
    collection(db, COLLECTIONS.chatMessages),
    where("chat", "==", chatRef),
    orderBy("timestamp", "desc"),
    limit(200),
  );

  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs
        .map((d) => mapMessage(d.id, d.data()))
        .reverse();
      onData(messages);
    },
    (err) => onError?.(err),
  );
}

export async function enrichChatPreviews(
  chats: ChatDoc[],
  currentUid: string,
): Promise<ChatPreview[]> {
  const previews: ChatPreview[] = [];

  for (const chat of chats) {
    const otherUserId = chat.userIds.find((id) => id !== currentUid);
    let otherUserName: string | undefined;
    let otherUserPhoto: string | undefined;

    if (otherUserId) {
      const profile = await getUserDoc(otherUserId);
      otherUserName =
        profile?.display_name || profile?.userName || otherUserId;
      otherUserPhoto = profile?.photo_url;
    }

    const unread = !chat.lastMessageSeenByIds.includes(currentUid);

    previews.push({
      ...chat,
      otherUserId,
      otherUserName,
      otherUserPhoto,
      unread,
    });
  }

  return previews;
}

export async function findDirectChat(
  currentUid: string,
  otherUid: string,
): Promise<string | null> {
  const db = getFirebaseDb();
  const meRef = userRef(currentUid);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.chats),
      where("users", "array-contains", meRef),
      limit(40),
    ),
  );

  for (const d of snap.docs) {
    const userIds = refsToIds(d.data().users);
    if (userIds.length === 2 && userIds.includes(otherUid)) {
      return d.id;
    }
  }
  return null;
}

export async function findOrCreateDirectChat(
  currentUid: string,
  otherUid: string,
): Promise<string> {
  const existing = await findDirectChat(currentUid, otherUid);
  if (existing) {
    await restoreChatToInbox(existing, currentUid);
    return existing;
  }

  const db = getFirebaseDb();
  const meRef = userRef(currentUid);
  const otherRef = userRef(otherUid);
  const chatRef = doc(collection(db, COLLECTIONS.chats));

  await setDoc(chatRef, {
    user_a: meRef,
    user_b: otherRef,
    users: [meRef, otherRef],
    last_message: "",
    last_message_time: serverTimestamp(),
    last_message_sent_by: meRef,
    last_message_seen_by: [meRef],
    group_chat_id: Math.floor(Math.random() * 9_000_000) + 1_000_000,
  });

  return chatRef.id;
}

export async function sendMessage(
  chatId: string,
  senderUid: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const db = getFirebaseDb();
  const chatRef = doc(db, COLLECTIONS.chats, chatId);
  const senderRef = userRef(senderUid);

  await addDoc(collection(db, COLLECTIONS.chatMessages), {
    user: senderRef,
    owner: senderRef,
    chat: chatRef,
    text: trimmed,
    timestamp: serverTimestamp(),
  });

  await updateDoc(chatRef, {
    last_message: trimmed,
    last_message_time: serverTimestamp(),
    last_message_sent_by: senderRef,
    last_message_seen_by: [senderRef],
    deleted_by: arrayRemove(senderRef),
  });

  const { notifyChatMessage } = await import("@/lib/services/notifications");
  void notifyChatMessage(chatId, senderUid, trimmed);
}

export async function markChatSeen(
  chatId: string,
  currentUid: string,
): Promise<void> {
  const db = getFirebaseDb();
  const chatRef = doc(db, COLLECTIONS.chats, chatId);
  const meRef = userRef(currentUid);
  await updateDoc(chatRef, {
    last_message_seen_by: [meRef],
  });
}
