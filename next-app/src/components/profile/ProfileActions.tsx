"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

function igBtn(extra = "") {
  return `rounded-lg bg-surface-overlay px-4 py-1.5 text-sm font-semibold transition hover:bg-surface-card ${extra}`;
}

export function IgButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${igBtn()} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IgLinkButton({
  children,
  className = "",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center ${igBtn()} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}

export { igBtn };
