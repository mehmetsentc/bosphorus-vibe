"use client";

import { useNavigationOptional } from "@/components/layout/NavigationProvider";

export function NavigationProgress() {
  const nav = useNavigationOptional();
  if (!nav?.isNavigating) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200] h-[3px] overflow-hidden bg-transparent md:left-[244px]"
      aria-hidden
    >
      <div className="nav-progress-bar h-full w-1/3 bg-gold" />
    </div>
  );
}
