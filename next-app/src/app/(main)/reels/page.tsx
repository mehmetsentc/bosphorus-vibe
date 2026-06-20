"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReelFeed } from "@/components/reels/ReelFeed";
import { ReelsShell } from "@/components/reels/ReelsShell";
import { ReelsPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useReelsPosts } from "@/lib/hooks/usePosts";
import { useSeenPosts } from "@/lib/hooks/useSeenPosts";
import { useInfiniteScrollPosts } from "@/lib/hooks/useInfiniteScrollPosts";
import { useAccess } from "@/lib/hooks/useAccess";
import { consumeReelsRefreshPending } from "@/lib/utils/invalidate-feed-cache";

export default function ReelsPage() {
  const { isGuest } = useAccess();
  const {
    posts,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    loadMore,
    refresh,
    deletePost,
    postsSnapshot,
    hasMoreSnapshot,
  } = useReelsPosts();
  const { markSeen, filterPosts, needsMore, refreshWithUnseen } = useSeenPosts();
  const { items, appendCycle, resetCycles } = useInfiniteScrollPosts(
    posts,
    hasMore,
    filterPosts,
  );
  const displayPosts = useMemo(() => items.map((i) => i.post), [items]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [resetScrollToken, setResetScrollToken] = useState(0);

  const handleRefresh = useCallback(async () => {
    resetCycles();
    await refreshWithUnseen(
      refresh,
      loadMore,
      () => postsSnapshot.current,
      () => hasMoreSnapshot.current,
    );
    setResetScrollToken((n) => n + 1);
  }, [refresh, loadMore, refreshWithUnseen, postsSnapshot, hasMoreSnapshot, resetCycles]);

  useEffect(() => {
    if (consumeReelsRefreshPending()) {
      void handleRefresh();
    }
  }, [handleRefresh]);

  const unseenCount = useMemo(
    () => filterPosts(posts).length,
    [posts, filterPosts],
  );
  useEffect(() => {
    if (!needsMore(unseenCount, hasMore) || loadingMore) return;
    void loadMore();
  }, [unseenCount, hasMore, needsMore, loadMore, loadingMore]);

  if (loading && posts.length === 0) {
    return (
      <ReelsShell>
        <ReelsPageSkeleton />
      </ReelsShell>
    );
  }

  return (
    <ReelsShell>
      <PullToRefresh
        onRefresh={handleRefresh}
        refreshing={refreshing}
        scrollRef={scrollRef}
        className="reels-pull-root"
      >
        {refreshing && (
          <div className="absolute left-1/2 top-3 z-[120] -translate-x-1/2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}
        <ReelFeed
          posts={displayPosts}
          postKeys={items.map((i) => i.itemKey)}
          hasMore={!isGuest && hasMore}
          loadingMore={loadingMore}
          onLoadMore={isGuest ? undefined : loadMore}
          onNearCatalogEnd={isGuest ? undefined : appendCycle}
          onPostDeleted={deletePost}
          guestPreview={isGuest}
          onPostSeen={markSeen}
          scrollContainerRef={scrollRef}
          resetScrollToken={resetScrollToken}
        />
      </PullToRefresh>
    </ReelsShell>
  );
}
