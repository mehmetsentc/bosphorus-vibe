"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { TimelinePostCard } from "@/components/timeline/TimelinePostCard";
import { useFeedPosts } from "@/lib/hooks/usePosts";
import { groupPostsByTimelineDay } from "@/lib/utils/timeline-groups";
import { useI18n, useT } from "@/components/providers/I18nProvider";

function TimelineSkeleton() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-surface-overlay" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-surface-overlay" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-surface-overlay" />
            </div>
          </div>
          <div className="aspect-[4/5] animate-pulse bg-surface-overlay" />
          <div className="space-y-2 px-3 pt-3">
            <div className="h-4 w-32 animate-pulse rounded bg-surface-overlay" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-surface-overlay" />
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
      <section className="px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">{t("timelineEmptyTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("noPostsInFeed")}</p>
      </section>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <section className="pb-8">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="sticky top-[57px] z-20 flex justify-center bg-background/85 py-2 backdrop-blur-md">
              <span className="rounded-full bg-surface-overlay/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                {group.label}
              </span>
            </div>

            {group.posts.map((post) => (
              <TimelinePostCard key={post.id} post={post} />
            ))}
          </div>
        ))}

        <div ref={sentinelRef} className="h-1" aria-hidden />

        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="pb-4 pt-2 text-center text-sm text-muted">{t("timelineEnd")}</p>
        )}
      </section>
    </PullToRefresh>
  );
}
