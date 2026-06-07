"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type NavigationContextValue = {
  isNavigating: boolean;
  pendingHref: string | null;
  startNavigation: (href: string) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function normalizePath(href: string): string {
  try {
    const url = new URL(href, "http://local");
    return url.pathname;
  } catch {
    return href.split("?")[0] ?? href;
  }
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const startNavigation = useCallback((href: string) => {
    const path = normalizePath(href);
    if (path === pathname) return;
    setPendingHref(path);
    setIsNavigating(true);
  }, [pathname]);

  useEffect(() => {
    setIsNavigating(false);
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.download) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
        return;
      }
      const path = normalizePath(href);
      if (path !== pathname) startNavigation(path);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pathname, startNavigation]);

  const value = useMemo(
    () => ({ isNavigating, pendingHref, startNavigation }),
    [isNavigating, pendingHref, startNavigation],
  );

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return ctx;
}

export function useNavigationOptional() {
  return useContext(NavigationContext);
}
