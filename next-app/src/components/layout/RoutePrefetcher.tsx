"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NAV_ITEMS } from "@/components/layout/nav-config";

const EXTRA_ROUTES = ["/favorites", "/upload", "/brand"];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const routes = [...NAV_ITEMS.map((item) => item.href), ...EXTRA_ROUTES];

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
