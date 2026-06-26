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
import { useVideoSoundStore } from "@/store/videoSoundStore";

/**
 * Full-screen reels opened from a feed video tap — continues with the reels feed.
 */
export default function FeedPostViewPage({
  params,
}: {
  params: { postId: string };
}) {
  const { isGuest } = useAccess();
  const setReelsMuted = useVideoSoundStore((s) => s.setReelsMuted);
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
  const { markSeen, filterPosts, needsMore, refreshWithUnseen } = useSeenPosts({
    pinIds: [params.postId],
  });
  const { items, resetCycles } = useInfiniteScrollPosts(
    posts,
    hasMore,
    filterPosts,
    { showAllLoaded: true },
  );
  const displayPosts = useMemo(() => items.map((i) => i.post), [items]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [resetScrollToken, setResetScrollToken] = useState(0);

  useEffect(() => {
    setReelsMuted(false);
  }, [setReelsMuted]);

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
          postKeys={items.map((i) => i.itemKey)}
          hasMore={!isGuest && hasMore}
          loadingMore={loadingMore}
          onLoadMore={isGuest ? undefined : loadMore}
          onPostDeleted={deletePost}
          guestPreview={isGuest}
          initialPostId={params.postId}
          onPostSeen={markSeen}
          scrollContainerRef={scrollRef}
          resetScrollToken={resetScrollToken}
        />
      </PullToRefresh>
    </ReelsShell>
  );
}
