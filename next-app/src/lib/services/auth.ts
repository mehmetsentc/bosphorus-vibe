import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { resetAppStore } from "@/store/appStore";
import { clearAccessCookie } from "@/lib/session/cookies";
import { toDate } from "@/lib/utils/firestore-helpers";
import { COLLECTIONS, type MessagePrivacy, type UserDoc } from "@/types";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  await upsertUser(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // continue local sign-out
  }
  clearAccessCookie();
  resetAppStore();
  await signOut(getFirebaseAuth());
}

async function upsertUser(user: User): Promise<void> {
  const ref = doc(getFirebaseDb(), COLLECTIONS.users, user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    display_name: user.displayName ?? "",
    userName: user.displayName ?? "",
    email: user.email ?? "",
    photo_url: user.photoURL ?? "",
    created_time: serverTimestamp(),
    bio: "",
    role: "user",
    title: "",
  });
}

export async function updateUserPhoto(
  uid: string,
  photoBlob: Blob,
): Promise<string> {
  const { uploadBlob } = await import("@/lib/services/firestore");
  const url = await uploadBlob(photoBlob, `users/${uid}/profile/avatar.jpg`);
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid), {
    photo_url: url,
  });
  const auth = getFirebaseAuth();
  if (auth.currentUser?.uid === uid) {
    await updateProfile(auth.currentUser, { photoURL: url });
  }
  return url;
}

export async function updateUserProfile(
  uid: string,
  data: {
    display_name: string;
    userName: string;
    bio: string;
    role?: string;
  },
): Promise<void> {
  const payload: Record<string, string> = {
    display_name: data.display_name.trim(),
    userName: data.userName.trim(),
    bio: data.bio.trim(),
  };
  if (data.role && data.role !== "admin") payload.role = data.role;

  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid), payload);

  const auth = getFirebaseAuth();
  if (auth.currentUser?.uid === uid) {
    await updateProfile(auth.currentUser, {
      displayName: data.display_name.trim(),
    });
  }
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: data.uid ?? uid,
    display_name: data.display_name ?? data.name ?? "",
    userName: data.userName ?? data.display_name ?? "",
    email: data.email ?? "",
    photo_url: data.photo_url ?? data.photoURL ?? "",
    bio: data.bio ?? "",
    role: data.role ?? "",
    title: data.title ?? "",
    created_time: toDate(data.created_time ?? data.createdAt),
    last_active_time: data.last_active_time
      ? toDate(data.last_active_time)
      : undefined,
    total_activity_participants:
      typeof data.total_activity_participants === "number"
        ? data.total_activity_participants
        : 0,
    allow_messages:
      data.allow_messages === "followers" ||
      data.allow_messages === "off" ||
      data.allow_messages === "everyone"
        ? data.allow_messages
        : undefined,
  };
}

export async function updateUserMessagePrivacy(
  uid: string,
  privacy: MessagePrivacy,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.users, uid), {
    allow_messages: privacy,
  });
}
