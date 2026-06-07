import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, SESSION_COOKIE } from "@/lib/session/constants";
import { SECURITY_HEADERS } from "@/lib/security/headers";

const PUBLIC_PATHS = [
  "/welcome",
  "/login",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
];

const AUTH_ONLY_PREFIXES = ["/profile", "/upload", "/favorites", "/admin"];

const GUEST_ALLOWED_PREFIXES = [
  "/home",
  "/events",
  "/reels",
  "/team",
  "/brand",
  "/post",
  "/user",
  "/feed",
  "/messages",
];

const PRIVATE_ROBOTS = ["/profile", "/admin", "/upload", "/favorites"];

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

function withHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return withHeaders(NextResponse.next());
  }

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const hasAccess = access === "guest" || access === "auth" || hasSession;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = hasAccess ? "/home" : "/welcome";
    return withHeaders(NextResponse.redirect(url));
  }

  if (pathname === "/login" && hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return withHeaders(NextResponse.redirect(url));
  }

  if (isPublicPath(pathname)) {
    return withHeaders(NextResponse.next());
  }

  if (matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
    if (!hasSession && access !== "auth") {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      url.searchParams.set("reason", "auth-required");
      return withHeaders(NextResponse.redirect(url));
    }
    const response = NextResponse.next();
    if (matchesPrefix(pathname, PRIVATE_ROBOTS)) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return withHeaders(response);
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

  return withHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)",
  ],
};
