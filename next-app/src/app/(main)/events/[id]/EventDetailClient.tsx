"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  enrichPostsWithUsers,
  getEventById,
  getPostsByEventId,
} from "@/lib/services/firestore";
import { ActivityUploadModal } from "@/components/upload/ActivityUploadModal";
import { EventMediaFeed } from "@/components/events/EventMediaFeed";
import { EventPosterCountdown } from "@/components/events/EventPosterCountdown";
import { WorldCupPopupButton } from "@/components/events/WorldCupPopupButton";
import { PageShell } from "@/components/layout/PageShell";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  IconClock,
  IconDailyActivity,
  IconEveningShow,
  IconLocation,
} from "@/components/icons/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  formatEventListDate,
  getNextEventOccurrence,
} from "@/lib/utils/event-dates";
import { getDailyRepeatLabel } from "@/lib/utils/firestore-helpers";
import { isAnimationTeamRole } from "@/lib/utils/roles";
import type { EventDoc, UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

export function EventDetailClient({ id }: { id: string }) {
  const t = useT();
  const { locale, dateLocale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [mediaPosts, setMediaPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const backHref = searchParams.get("from") || "/events";
  const canUpload = isAnimationTeamRole(profile?.role);
  const isDaily = event?.eventCategory.trim().toLowerCase() === "daily";
  const isShow = event?.eventCategory.trim().toLowerCase() === "show time";
  const occurrence = event ? getNextEventOccurrence(event) : null;

  const loadMedia = useCallback(async (eventId: string) => {
    const posts = await getPostsByEventId(eventId);
    setMediaPosts(await enrichPostsWithUsers(posts));
  }, []);

  useEffect(() => {
    getEventById(id)
      .then(async (e) => {
        if (!e) {
          router.replace("/events");
          return;
        }
        setEvent(e);
        await loadMedia(e.id);
      })
      .finally(() => setLoading(false));
  }, [id, router, loadMedia]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!event) return null;

  const whenLabel = isDaily
    ? `${getDailyRepeatLabel(locale)} · ${event.eventTimeLabel}`
    : `${formatEventListDate(event.eventDate, locale)} · ${event.eventTimeLabel}`;

  return (
    <PageShell className="pb-10">
      <div className="flex items-center gap-3 py-3">
        <Link
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-overlay text-lg transition hover:bg-surface-card"
          aria-label={t("back")}
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{event.eventName}</p>
          <p className="truncate text-xs text-muted">{event.eventCategory}</p>
          <div className="mt-2">
            <WorldCupPopupButton />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
        {event.eventImage ? (
          <div className="relative aspect-[16/10] w-full bg-black">
            <OptimizedImage
              src={event.eventImage}
              alt={event.eventName}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            {occurrence && (
              <div className="absolute right-3 top-3 z-10">
                <EventPosterCountdown target={occurrence} compact />
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-gold/20 to-vibe/10">
            {isShow ? (
              <IconEveningShow size={48} className="text-gold/60" />
            ) : (
              <IconDailyActivity size={48} className="text-gold/60" />
            )}
            {occurrence && (
              <div className="absolute right-3 top-3">
                <EventPosterCountdown target={occurrence} compact />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 p-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              {isShow ? t("showTime") : t("sportsCategory")}
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight">
              {event.eventName}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted">
            <IconClock size={16} className="shrink-0 text-gold" />
            <span>{whenLabel}</span>
          </div>

          {event.eventLocation && (
            <div className="flex items-start gap-2 text-sm text-muted">
              <IconLocation size={16} className="mt-0.5 shrink-0 text-gold" />
              <span>{event.eventLocation}</span>
            </div>
          )}

          {!isDaily && (
            <p className="text-xs text-muted">
              {event.eventDate.toLocaleDateString(dateLocale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {event.eventDescription && (
            <p className="text-sm leading-relaxed text-foreground/90">
              {event.eventDescription}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            {canUpload && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="flex-1 rounded-xl bg-vibe py-3 text-sm font-bold text-black transition hover:brightness-110"
              >
                {t("eventPostMedia")}
              </button>
            )}
            <Link
              href="/events"
              className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-semibold text-muted transition hover:text-foreground"
            >
              {t("allEvents")}
            </Link>
          </div>
        </div>
      </div>

      <EventMediaFeed posts={mediaPosts} eventId={event.id} />

      <ActivityUploadModal
        open={uploadOpen}
        event={event}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => loadMedia(event.id)}
      />
    </PageShell>
  );
}
