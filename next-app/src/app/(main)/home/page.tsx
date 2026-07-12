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
      <div className="space-y-8 py-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-surface-overlay" />
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
