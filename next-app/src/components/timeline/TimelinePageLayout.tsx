"use client";

import type { ReactNode } from "react";

/** Single-column chronological social feed layout. */
export function TimelinePageLayout({ children }: { children: ReactNode }) {
  return <div className="relative w-full px-0 pb-20 pt-0 md:pb-8">{children}</div>;
}
