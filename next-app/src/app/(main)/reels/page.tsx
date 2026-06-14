"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReelFeed } from "@/components/reels/ReelFeed";
import { ReelsShell } from "@/components/reels/ReelsShell";
import { ReelsPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useReelsPosts } from "@/lib/hooks/usePosts";
import { useSeenPosts } from "@/lib/hooks/useSeenPosts";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [resetScrollToken, setResetScrollToken] = useState(0);

  const displayPosts = useMemo(
    () => filterPosts(posts),
    [posts, filterPosts],
  );

  const handleRefresh = useCallback(async () => {
    await refreshWithUnseen(
      refresh,
      loadMore,
      () => postsSnapshot.current,
      () => hasMoreSnapshot.current,
    );
    setResetScrollToken((n) => n + 1);
  }, [refresh, loadMore, refreshWithUnseen, postsSnapshot, hasMoreSnapshot]);

  useEffect(() => {
    if (consumeReelsRefreshPending()) {
      void handleRefresh();
    }
  }, [handleRefresh]);

  useEffect(() => {
    if (!needsMore(displayPosts.length, hasMore) || loadingMore) return;
    void loadMore();
  }, [displayPosts.length, hasMore, needsMore, loadMore, loadingMore]);

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
          hasMore={!isGuest && hasMore}
          loadingMore={loadingMore}
          onLoadMore={isGuest ? undefined : loadMore}
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
