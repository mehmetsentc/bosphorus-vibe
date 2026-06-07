"use client";

import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Tam genişlik (Reels hariç nadiren) */
  fullWidth?: boolean;
};

export function PageShell({
  children,
  className = "",
  fullWidth = false,
}: PageShellProps) {
  return (
    <main
      className={`mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 ${
        fullWidth
          ? "max-w-[1600px]"
          : "max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
      } ${className}`}
    >
      {children}
    </main>
  );
}
