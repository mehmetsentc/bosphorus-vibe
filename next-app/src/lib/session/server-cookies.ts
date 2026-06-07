import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_DAYS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_DAYS,
  type AccessLevel,
} from "@/lib/session/constants";

const isProd = process.env.NODE_ENV === "production";

function cookieBase(maxAgeDays: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}

export function setServerAccessCookie(level: AccessLevel) {
  cookies().set(ACCESS_COOKIE, level, cookieBase(ACCESS_MAX_AGE_DAYS));
}

export function setServerSessionCookie(session: string) {
  cookies().set(SESSION_COOKIE, session, cookieBase(SESSION_MAX_AGE_DAYS));
}

export function clearServerAuthCookies() {
  cookies().delete(ACCESS_COOKIE);
  cookies().delete(SESSION_COOKIE);
}

export function hasServerSession(): boolean {
  return Boolean(cookies().get(SESSION_COOKIE)?.value);
}
