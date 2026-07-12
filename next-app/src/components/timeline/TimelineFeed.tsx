"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { TimelinePostCard } from "@/components/timeline/TimelinePostCard";
import { useFeedPosts } from "@/lib/hooks/usePosts";
import { groupPostsByTimelineDay } from "@/lib/utils/timeline-groups";
import { useI18n, useT } from "@/components/providers/I18nProvider";

function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[2.75rem_1fr] gap-x-3 sm:grid-cols-[3.25rem_1fr]">
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="h-3 w-3 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-16 w-px animate-pulse bg-surface-overlay" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
            <div className="flex gap-3 px-4 py-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-surface-overlay" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-32 animate-pulse rounded bg-surface-overlay" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-surface-overlay" />
              </div>
            </div>
            <div className="aspect-[4/5] animate-pulse bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineFeed() {
  const t = useT();
  const { locale } = useI18n();
  const {
    posts,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    loadMore,
    refresh,
  } = useFeedPosts();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const groups = useMemo(
    () => groupPostsByTimelineDay(posts, locale, t),
    [posts, locale, t],
  );

  const handleRefresh = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (hasMore && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          loadMore().finally(() => {
            loadingMoreRef.current = false;
          });
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (loading && posts.length === 0) {
    return <TimelineSkeleton />;
  }

  if (!posts.length && !hasMore) {
    return (
      <section className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">{t("timelineEmptyTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("noPostsInFeed")}</p>
      </section>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <section className="relative">
        {groups.map((group) => (
          <div key={group.key} className="mb-2">
            <div className="relative z-10 mb-6 flex items-center gap-3 pl-[2.75rem] sm:pl-[3.25rem]">
              <span className="h-px flex-1 bg-border/80" />
              <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-border/80" />
            </div>

            {group.posts.map((post, index) => (
              <TimelinePostCard
                key={post.id}
                post={post}
                isLastInGroup={index === group.posts.length - 1}
              />
            ))}
          </div>
        ))}

        <div ref={sentinelRef} className="h-1" aria-hidden />

        {loadingMore && (
          <div className="flex justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="pb-6 text-center text-sm text-muted">{t("timelineEnd")}</p>
        )}
      </section>
    </PullToRefresh>
  );
}
