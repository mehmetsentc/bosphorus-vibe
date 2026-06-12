import { ensureAuthReady } from "@/lib/firebase";

/** Admin API calls with session cookie + Firebase ID token fallback. */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const auth = await ensureAuthReady();
  const user = auth.currentUser;
  const headers = new Headers(init.headers);

  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
