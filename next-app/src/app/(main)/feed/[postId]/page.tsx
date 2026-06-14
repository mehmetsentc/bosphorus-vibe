"use client";

import { useCallback } from "react";
import { ReelFeed } from "@/components/reels/ReelFeed";
import { ReelsShell } from "@/components/reels/ReelsShell";
import { ReelsPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useFeedPosts } from "@/lib/hooks/usePosts";
import { useAccess } from "@/lib/hooks/useAccess";

/**
 * Full-screen reels-style view that opens when the user taps a video in the feed.
 * Uses the same feed posts cache so there's no extra fetch — starts scrolled
 * to the tapped post via `initialPostId`.
 */
export default function FeedPostViewPage({
  params,
}: {
  params: { postId: string };
}) {
  const { isGuest } = useAccess();
  const {
    posts,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    loadMore,
    setPosts,
    refresh,
  } = useFeedPosts();

  const deletePost = useCallback(
    (postId: string) => setPosts((prev) => prev.filter((p) => p.id !== postId)),
    [setPosts],
  );

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
        onRefresh={refresh}
        refreshing={refreshing}
        className="reels-pull-root"
      >
        {refreshing && (
          <div className="absolute left-1/2 top-3 z-[120] -translate-x-1/2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}
        <ReelFeed
          posts={posts}
          hasMore={!isGuest && hasMore}
          loadingMore={loadingMore}
          onLoadMore={isGuest ? undefined : loadMore}
          onPostDeleted={deletePost}
          guestPreview={isGuest}
          initialPostId={params.postId}
        />
      </PullToRefresh>
    </ReelsShell>
  );
}
