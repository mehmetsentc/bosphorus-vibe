"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { WorldCupPopupButton } from "@/components/events/WorldCupPopupButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";

export function EventsPageHeader({
  onRefresh,
  refreshing = false,
}: {
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
}) {
  const { profile, user } = useAuth();
  const t = useT();
  const name =
    profile?.display_name ||
    profile?.userName ||
    user?.displayName ||
    t("profileDefault");
  const photo = profile?.photo_url || user?.photoURL || "";

  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center gap-2 md:hidden">
          <LogoMark className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold leading-tight sm:text-2xl">
          {t("eventsGreeting", { name: name.split(" ")[0] })}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("eventsSubtitle")}</p>
        <div className="mt-3">
          <WorldCupPopupButton />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            aria-label={refreshing ? "Refreshing" : "Refresh"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-overlay transition hover:bg-surface-card disabled:opacity-50"
          >
            <svg
              className={`h-5 w-5 text-gold ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>
        )}
        <Link
          href="/profile"
          className="shrink-0 rounded-full ring-2 ring-border transition hover:ring-gold/40"
        >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay text-lg font-bold text-gold">
            {name[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </Link>
      </div>
    </header>
  );
}
