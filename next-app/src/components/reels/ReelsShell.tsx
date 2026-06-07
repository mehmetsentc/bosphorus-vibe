"use client";

import Link from "next/link";
import { useT } from "@/components/providers/I18nProvider";

type ReelsShellProps = {
  children: React.ReactNode;
  backHref?: string;
  showBack?: boolean;
};

export function ReelsShell({
  children,
  backHref = "/home",
  showBack = true,
}: ReelsShellProps) {
  const t = useT();

  return (
    <div className="reels-shell">
      {showBack && (
        <Link
          href={backHref}
          className="reels-shell-back flex h-10 items-center rounded-full bg-black/50 px-4 text-sm text-white backdrop-blur-md transition hover:bg-black/70"
        >
          ← {t("back")}
        </Link>
      )}
      <div className="reels-shell-body">{children}</div>
    </div>
  );
}
