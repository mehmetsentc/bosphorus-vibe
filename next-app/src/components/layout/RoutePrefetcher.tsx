"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { getAccessCookie } from "@/lib/session/cookies";

const EXTRA_ROUTES = ["/favorites", "/upload", "/brand"];

const GUEST_BLOCKED = new Set(["/profile", "/messages", "/upload", "/favorites", "/admin"]);
const AUTH_ONLY = new Set(["/profile", "/upload", "/favorites", "/admin", "/messages"]);

function routesForAccess(): string[] {
  const access = getAccessCookie();
  const all = [...NAV_ITEMS.map((item) => item.href), ...EXTRA_ROUTES];

  if (access === "guest") {
    return all.filter((href) => !GUEST_BLOCKED.has(href));
  }
  if (!access) {
    return all.filter((href) => !AUTH_ONLY.has(href));
  }
  return all;
}

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const routes = routesForAccess();

    function prefetchAll() {
      for (const href of routes) {
        router.prefetch(href);
      }
    }

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetchAll, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }

    const timer = setTimeout(prefetchAll, 300);
    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
