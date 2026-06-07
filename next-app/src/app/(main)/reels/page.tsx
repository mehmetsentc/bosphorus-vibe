"use client";

import dynamic from "next/dynamic";
import { ReelsShell } from "@/components/reels/ReelsShell";
import { ReelsPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { useReelsPosts } from "@/lib/hooks/usePosts";
import { useAccess } from "@/lib/hooks/useAccess";

const ReelFeed = dynamic(
  () =>
    import("@/components/reels/ReelFeed").then((m) => ({
      default: m.ReelFeed,
    })),
  { ssr: false, loading: () => <ReelsPageSkeleton /> },
);

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
  } = useReelsPosts();

  if (loading) {
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
        />
      </PullToRefresh>
    </ReelsShell>
  );
}
