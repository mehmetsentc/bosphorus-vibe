export type FirebaseConfigIssue = {
  key: string;
  message: string;
};

const ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export function getFirebaseEnv(): Record<(typeof ENV_KEYS)[number], string> {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "",
  };
}

/** Firebase OAuth must use {projectId}.firebaseapp.com — custom domain proxy breaks the handler. */
export function resolveFirebaseAuthDomain(): string {
  const env = getFirebaseEnv();
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) {
    return `${projectId}.firebaseapp.com`;
  }
  return env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
}

export function getFirebaseConfigIssues(): FirebaseConfigIssue[] {
  const env = getFirebaseEnv();
  const issues: FirebaseConfigIssue[] = [];

  for (const key of ENV_KEYS) {
    if (!env[key]) {
      issues.push({ key: `missing_${key}`, message: `${key} is not set` });
    }
  }

  const { NEXT_PUBLIC_FIREBASE_API_KEY } = env;

  if (NEXT_PUBLIC_FIREBASE_API_KEY && !NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("AIza")) {
    issues.push({
      key: "invalid_api_key_format",
      message: "NEXT_PUBLIC_FIREBASE_API_KEY format looks invalid",
    });
  }

  return issues;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfigIssues().length === 0;
}
