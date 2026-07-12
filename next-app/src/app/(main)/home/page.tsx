"use client";

import dynamic from "next/dynamic";
import { StoriesStrip } from "@/components/stories/StoriesStrip";
import { IgFeedHeader } from "@/components/home/IgFeedHeader";
import { FeedPageLayout } from "@/components/feed/FeedPageLayout";
import { PageShell } from "@/components/layout/PageShell";

const ExploreGrid = dynamic(
  () =>
    import("@/components/home/ExploreGrid").then((m) => ({
      default: m.ExploreGrid,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-3 gap-[1.5px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square w-full animate-pulse bg-surface-overlay"
          />
        ))}
      </div>
    ),
  },
);

export default function HomePage() {
  return (
    <PageShell className="px-0 py-0 md:px-4">
      <FeedPageLayout>
        <IgFeedHeader />
        <StoriesStrip />
        <ExploreGrid />
      </FeedPageLayout>
    </PageShell>
  );
}
