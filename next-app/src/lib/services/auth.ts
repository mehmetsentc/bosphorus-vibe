import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  type AuthError,
  type ConfirmationResult,
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
  | "authErrorInvalidPhone"
  | "authErrorInvalidCode"
  | "authErrorTooManyRequests"
  | "authErrorApiKey"
>;

export type { ConfirmationResult };

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let redirectResultPromise: Promise<User | null> | null = null;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** Popup on localhost only; redirect everywhere else (avoids firebaseapp.com handler errors). */
function prefersRedirect(): boolean {
  if (typeof window === "undefined") return false;
  if (!isLocalDevHost()) return true;
  const ua = navigator.userAgent;
  const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const inAppBrowser = /FBAN|FBAV|Instagram|Line\//i.test(ua);
  return mobile || inAppBrowser;
}

function assertAuthDomain(): void {
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!authDomain || !projectId) return;
  const expected = `${projectId}.firebaseapp.com`;
  if (authDomain !== expected) {
    console.warn(
      `[auth] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN should be "${expected}" (got "${authDomain}"). Google sign-in may fail.`,
    );
  }
}

export function getAuthErrorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as AuthError).code);
    if (code && code !== "undefined") return code;
  }
  if (err instanceof Error) {
    const match = err.message.match(/\(auth\/[^)]+\)/);
    if (match) return match[0].slice(1, -1);
    return err.message;
  }
  return "";
}

export function formatAuthErrorMessage(
  code: string,
  translate: (key: AuthMessageKey) => string,
): string {
  const key = mapAuthErrorCode(code);
  const message = translate(key);
  if (key === "loginFailed" && code) {
    return `${message} (${code})`;
  }
  return message;
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
  if (c.includes("invalid-phone-number")) return "authErrorInvalidPhone";
  if (
    c.includes("invalid-verification-code") ||
    c.includes("code-expired")
  ) {
    return "authErrorInvalidCode";
  }
  if (c.includes("too-many-requests") || c.includes("quota-exceeded")) {
    return "authErrorTooManyRequests";
  }
  if (
    c.includes("invalid-api-key") ||
    c.includes("api-key-not-valid") ||
    c.includes("referer") ||
    c.includes("referrer") ||
    c.includes("app-not-authorized")
  ) {
    return "authErrorApiKey";
  }
  return "loginFailed";
}

function normalizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return `+9${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }
  return `+${digits}`;
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore stale verifier cleanup errors
    }
  }
  recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: "invisible",
  });
  return recaptchaVerifier;
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
      try {
        if (!isFirebaseConfigured()) return null;
        const result = await getRedirectResult(getFirebaseAuth());
        if (!result?.user) return null;
        try {
          await upsertUser(result.user);
        } catch (profileErr) {
          console.error("Profile upsert failed after redirect sign-in:", profileErr);
        }
        return result.user;
      } catch (err) {
        const code = getAuthErrorCode(err);
        console.error("Google redirect sign-in failed:", code, err);
        return null;
      } finally {
        redirectResultPromise = null;
      }
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

export async function startPhoneSignIn(
  phone: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> {
  assertFirebaseConfigured();
  const normalized = normalizePhoneNumber(phone);
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  return signInWithPhoneNumber(getFirebaseAuth(), normalized, verifier);
}

export async function confirmPhoneSignIn(
  confirmation: ConfirmationResult,
  code: string,
): Promise<User> {
  assertFirebaseConfigured();
  const result = await confirmation.confirm(code.trim());
  try {
    await upsertUser(result.user);
  } catch (profileErr) {
    console.error("Profile upsert failed after phone sign-in:", profileErr);
  }
  return result.user;
}

export async function signInAnonymous(): Promise<User> {
  assertFirebaseConfigured();
  const result = await signInAnonymously(getFirebaseAuth());
  try {
    await upsertUser(result.user);
  } catch (profileErr) {
    console.error("Profile upsert failed after anonymous sign-in:", profileErr);
  }
  return result.user;
}

function throwRedirectStarted(): never {
  const err = new Error("redirect started");
  (err as Error & { code: string }).code = "auth/redirect-started";
  throw err;
}

export async function signInWithGoogle(): Promise<User> {
  assertFirebaseConfigured();
  assertAuthDomain();

  const auth = getFirebaseAuth();

  if (prefersRedirect()) {
    startGoogleRedirect(auth);
    throwRedirectStarted();
  }

  try {
    const result = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver,
    );
    try {
      await upsertUser(result.user);
    } catch (profileErr) {
      console.error("Profile upsert failed after Google sign-in:", profileErr);
    }
    return result.user;
  } catch (err: unknown) {
    const code = getAuthErrorCode(err);
    console.error("Google popup sign-in failed, falling back to redirect:", code);
    startGoogleRedirect(auth);
    throwRedirectStarted();
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

  let displayName =
    displayNameOverride?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "";

  if (!displayName && user.isAnonymous) {
    displayName = "Misafir";
  }
  if (!displayName && user.phoneNumber) {
    displayName = user.phoneNumber;
  }

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
