"use client";

import type { ReactNode } from "react";

/** Wide single-column layout for the chronological timeline feed. */
export function TimelinePageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full px-0 pb-16 pt-0 md:pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[1.35rem] w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent sm:left-[1.65rem]"
      />
      {children}
    </div>
  );
}
