"use client";

import { StoriesStrip } from "@/components/stories/StoriesStrip";
import { FeedInfinite } from "@/components/home/FeedInfinite";
import { IgFeedHeader } from "@/components/home/IgFeedHeader";
import { FeedPageLayout } from "@/components/feed/FeedPageLayout";
import { PageShell } from "@/components/layout/PageShell";

export default function HomePage() {
  return (
    <PageShell className="px-0 py-0 md:px-4">
      <FeedPageLayout>
        <IgFeedHeader />
        <StoriesStrip />
        <FeedInfinite />
      </FeedPageLayout>
    </PageShell>
  );
}
