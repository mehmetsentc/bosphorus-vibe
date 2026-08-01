import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE_DAYS, SESSION_COOKIE } from "@/lib/session/constants";
import { SECURITY_HEADERS } from "@/lib/security/headers";

const PUBLIC_PATHS = [
  "/welcome",
  "/login",
  "/auth/google",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
];

/** Metadata / social images — must never hit the auth wall. */
const PUBLIC_ASSET_PATHS = [
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
];

const AUTH_ONLY_PREFIXES = ["/profile", "/upload", "/favorites", "/admin"];

/**
 * Browseable without prior cookie. Middleware issues a guest cookie so AuthGuard
 * and subsequent navigations work; crawlers also get real HTML.
 */
const SOFT_PUBLIC_PREFIXES = [
  "/home",
  "/events",
  "/feed",
  "/reels",
  "/team",
  "/members",
  "/brand",
  "/post",
];

/** Routes anonymous / guest users may open (matches AuthGuard + GuestBanner UX). */
const GUEST_ALLOWED_PREFIXES = [
  ...SOFT_PUBLIC_PREFIXES,
];

const PRIVATE_ROBOTS = [
  "/profile",
  "/admin",
  "/upload",
  "/favorites",
  "/login",
  "/auth",
  "/messages",
  "/notifications",
  "/user",
  "/post",
  "/feed",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isPublicAsset(pathname: string): boolean {
  return PUBLIC_ASSET_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function withHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function withPrivateRobots(response: NextResponse, pathname: string): NextResponse {
  if (matchesPrefix(pathname, PRIVATE_ROBOTS)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

function setGuestCookie(response: NextResponse): void {
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "guest",
    path: "/",
    maxAge: ACCESS_MAX_AGE_DAYS * 24 * 60 * 60,
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/__/auth") ||
    pathname.includes(".") ||
    isPublicAsset(pathname)
  ) {
    return withHeaders(NextResponse.next());
  }

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const hasAccess = access === "guest" || access === "auth" || hasSession;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    if (!hasAccess) {
      url.pathname = "/welcome";
    } else {
      url.pathname = "/home";
    }
    return withHeaders(NextResponse.redirect(url));
  }

  if (pathname === "/login" && hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return withHeaders(NextResponse.redirect(url));
  }

  if (isPublicPath(pathname)) {
    const response = NextResponse.next();
    return withHeaders(withPrivateRobots(response, pathname));
  }

  if (matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
    if (!hasSession && access !== "auth") {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      url.searchParams.set("reason", "auth-required");
      return withHeaders(NextResponse.redirect(url));
    }
    const response = NextResponse.next();
    return withHeaders(withPrivateRobots(response, pathname));
  }

  // Deep links + SEO: open soft-public routes and mint guest access once.
  if (!hasAccess && matchesPrefix(pathname, SOFT_PUBLIC_PREFIXES)) {
    const response = NextResponse.next();
    setGuestCookie(response);
    return withHeaders(withPrivateRobots(response, pathname));
  }

  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    if (pathname !== "/welcome") {
      url.searchParams.set("from", pathname);
    }
    return withHeaders(NextResponse.redirect(url));
  }

  if (access === "guest" && !matchesPrefix(pathname, GUEST_ALLOWED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    url.searchParams.set("reason", "guest-limited");
    return withHeaders(NextResponse.redirect(url));
  }

  const response = NextResponse.next();
  return withHeaders(withPrivateRobots(response, pathname));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
