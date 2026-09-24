"use client";

import dynamic from "next/dynamic";
import { FeedPageLayout } from "@/components/feed/FeedPageLayout";
import { StoriesStrip } from "@/components/stories/StoriesStrip";
import { TimelineFeedHeader } from "@/components/timeline/TimelineFeedHeader";
import { TimelinePageLayout } from "@/components/timeline/TimelinePageLayout";
import { PageShell } from "@/components/layout/PageShell";

const TimelineFeed = dynamic(
  () =>
    import("@/components/timeline/TimelineFeed").then((m) => ({
      default: m.TimelineFeed,
    })),
  {
    ssr: false,
    loading: () => (
      <div>
        {[0, 1].map((i) => (
          <div key={i} className="border-b border-border/70 pb-3">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3 w-28 animate-pulse rounded bg-surface-overlay" />
            </div>
            <div className="aspect-[4/5] animate-pulse bg-surface-overlay" />
          </div>
        ))}
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <PageShell className="px-0 py-0 md:px-4">
      <FeedPageLayout>
        <TimelinePageLayout>
          <TimelineFeedHeader />
          <StoriesStrip />
          <TimelineFeed />
        </TimelinePageLayout>
      </FeedPageLayout>
    </PageShell>
  );
}
