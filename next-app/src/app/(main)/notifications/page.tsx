"use client";

import { NotificationList } from "@/components/notifications/NotificationList";
import { PageShell } from "@/components/layout/PageShell";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotificationsPage() {
  const t = useT();
  const router = useRouter();
  const { isGuest } = useAccess();

  useEffect(() => {
    if (isGuest) {
      router.replace("/welcome?reason=auth-required");
    }
  }, [isGuest, router]);

  if (isGuest) return null;

  return (
    <PageShell className="max-w-lg px-0 py-0 md:mx-auto">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/home"
          className="text-sm font-semibold text-accent md:hidden"
        >
          ←
        </Link>
        <h1 className="flex-1 font-display text-base font-semibold">
          {t("notificationsTitle")}
        </h1>
      </header>
      <NotificationList />
    </PageShell>
  );
}
