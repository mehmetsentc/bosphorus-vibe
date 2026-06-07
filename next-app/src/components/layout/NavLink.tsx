"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link>;

/** Internal nav link — prefetch enabled, touch-optimized. */
export function NavLink({ prefetch = true, className = "", ...props }: NavLinkProps) {
  return (
    <Link
      prefetch={prefetch}
      className={`touch-manipulation ${className}`.trim()}
      {...props}
    />
  );
}
