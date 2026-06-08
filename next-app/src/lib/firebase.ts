import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  getFirebaseEnv,
  isFirebaseConfigured as checkFirebaseConfigured,
} from "@/lib/firebase/config";

export { getFirebaseConfigIssues, isFirebaseConfigured } from "@/lib/firebase/config";

const firebaseEnv = getFirebaseEnv();

const firebaseConfig = {
  apiKey: firebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: firebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: firebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let authReadyPromise: Promise<Auth> | null = null;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser.");
  }
  if (!checkFirebaseConfigured()) {
    const err = new Error("Firebase env vars missing");
    (err as Error & { code: string }).code = "auth/configuration-not-found";
    throw err;
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

function initAuth(): Auth {
  const firebaseApp = getFirebaseApp();
  try {
    return initializeAuth(firebaseApp, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (code === "auth/already-initialized") {
      return getAuth(firebaseApp);
    }
    throw err;
  }
}

/** Await before redirect/popup auth — persistence + resolver must be ready. */
export function ensureAuthReady(): Promise<Auth> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Firebase auth is browser-only."));
  }
  if (!authReadyPromise) {
    authReadyPromise = Promise.resolve().then(() => {
      if (!auth) auth = initAuth();
      return auth;
    });
  }
  return authReadyPromise;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = initAuth();
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}

/** @deprecated Use getFirebaseAuth() — kept for gradual migration */
export { getFirebaseAuth as authGetter };
