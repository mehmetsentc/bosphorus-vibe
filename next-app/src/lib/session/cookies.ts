import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_DAYS,
  type AccessLevel,
} from "@/lib/session/constants";

function maxAgeSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

export function setAccessCookie(level: AccessLevel): void {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeSeconds(ACCESS_MAX_AGE_DAYS);
  document.cookie = `${ACCESS_COOKIE}=${level}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAccessCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessCookie(): AccessLevel | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCESS_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "guest" || value === "auth" ? value : null;
}
