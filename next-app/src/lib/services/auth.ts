import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  type AuthError,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { resetAppStore } from "@/store/appStore";
import { clearAccessCookie } from "@/lib/session/cookies";
import { toDate } from "@/lib/utils/firestore-helpers";
import { COLLECTIONS, type MessagePrivacy, type UserDoc } from "@/types";
import type { Messages } from "@/i18n/messages/en";

type AuthMessageKey = Extract<
  keyof Messages,
  | "loginFailed"
  | "authErrorDomain"
  | "authErrorPopup"
  | "authErrorNetwork"
  | "authErrorProfile"
  | "authErrorConfig"
  | "authErrorGoogleDisabled"
  | "authErrorInvalidEmail"
  | "authErrorWrongPassword"
  | "authErrorUserNotFound"
  | "authErrorEmailInUse"
  | "authErrorWeakPassword"
  | "authErrorEmailDisabled"
>;

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let redirectResultPromise: Promise<User | null> | null = null;

/** Mobile / in-app browsers only — desktop uses popup (more reliable on Vercel). */
function prefersRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const inAppBrowser = /FBAN|FBAV|Instagram|Line\//i.test(ua);
  return mobile || inAppBrowser;
}

export function getAuthErrorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as AuthError).code);
  }
  if (err instanceof Error) return err.message;
  return "";
}

export function mapAuthErrorCode(code: string): AuthMessageKey {
  const c = code.toLowerCase();
  if (c.includes("configuration-not-found") || c.includes("env vars missing")) {
    return "authErrorConfig";
  }
  if (c.includes("unauthorized-domain")) return "authErrorDomain";
  if (c.includes("operation-not-allowed")) return "authErrorEmailDisabled";
  if (
    c.includes("popup-blocked") ||
    c.includes("popup-closed-by-user") ||
    c.includes("cancelled-popup-request")
  ) {
    return "authErrorPopup";
  }
  if (c.includes("network-request-failed") || c.includes("timeout")) {
    return "authErrorNetwork";
  }
  if (c.includes("permission-denied")) return "authErrorProfile";
  if (c.includes("invalid-email")) return "authErrorInvalidEmail";
  if (
    c.includes("wrong-password") ||
    c.includes("invalid-credential") ||
    c.includes("invalid-login-credentials")
  ) {
    return "authErrorWrongPassword";
  }
  if (c.includes("user-not-found")) return "authErrorUserNotFound";
  if (c.includes("email-already-in-use")) return "authErrorEmailInUse";
  if (c.includes("weak-password")) return "authErrorWeakPassword";
  return "loginFailed";
}

function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    const err = new Error("Firebase env vars missing");
    (err as Error & { code: string }).code = "auth/configuration-not-found";
    throw err;
  }
}

export async function completeGoogleRedirectSignIn(): Promise<User | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      if (!isFirebaseConfigured()) return null;
      const result = await getRedirectResult(getFirebaseAuth());
      if (!result?.user) return null;
      try {
        await upsertUser(result.user);
      } catch (profileErr) {
        console.error("Profile upsert failed after redirect sign-in:", profileErr);
      }
      return result.user;
    })();
  }
  return redirectResultPromise;
}

function startGoogleRedirect(auth: ReturnType<typeof getFirebaseAuth>): void {
  void signInWithRedirect(auth, provider).catch((err) => {
    console.error("signInWithRedirect failed:", err);
  });
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  assertFirebaseConfigured();
  const trimmedEmail = email.trim();
  const result = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    trimmedEmail,
    password,
  );
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  assertFirebaseConfigured();
  const trimmedEmail = email.trim();
  const name = displayName?.trim() ?? "";
  const result = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    trimmedEmail,
    password,
  );
  if (name) {
    await updateProfile(result.user, { displayName: name });
  }
  try {
    await upsertUser(result.user, name);
  } catch (profileErr) {
    console.error("Profile upsert failed after email sign-up:", profileErr);
  }
  return result.user;
}

export async function signInWithGoogle(): Promise<User> {
  assertFirebaseConfigured();

  const auth = getFirebaseAuth();

  if (prefersRedirect()) {
    startGoogleRedirect(auth);
    const err = new Error("redirect started");
    (err as Error & { code: string }).code = "auth/redirect-started";
    throw err;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    try {
      await upsertUser(result.user);
    } catch (profileErr) {
      console.error("Profile upsert failed after Google sign-in:", profileErr);
    }
    return result.user;
  } catch (err: unknown) {
    const code = getAuthErrorCode(err);
    if (
      code === "auth/popup-blocked" ||
      code === "auth/cancelled-popup-request"
    ) {
      startGoogleRedirect(auth);
      const redirectErr = new Error("redirect started");
      (redirectErr as Error & { code: string }).code = "auth/redirect-started";
      throw redirectErr;
    }
    throw err;
  }
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

async function upsertUser(user: User, displayNameOverride?: string): Promise<void> {
  const ref = doc(getFirebaseDb(), COLLECTIONS.users, user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const displayName =
    displayNameOverride?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "";

  await setDoc(ref, {
    uid: user.uid,
    display_name: displayName,
    userName: displayName,
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
