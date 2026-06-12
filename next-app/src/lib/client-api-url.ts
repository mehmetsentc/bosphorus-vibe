import { getCanonicalOrigin } from "@/lib/services/auth";

/** Same-origin API path, always on www when the bare domain would 308-redirect. */
export function clientApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  return `${getCanonicalOrigin()}${normalized}`;
}
