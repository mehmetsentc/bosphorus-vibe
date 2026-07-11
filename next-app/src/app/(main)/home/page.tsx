"use client";

import dynamic from "next/dynamic";
import { StoriesStrip } from "@/components/stories/StoriesStrip";
import { IgFeedHeader } from "@/components/home/IgFeedHeader";
import { FeedPageLayout } from "@/components/feed/FeedPageLayout";
import { PageShell } from "@/components/layout/PageShell";

const FeedInfinite = dynamic(
  () =>
    import("@/components/home/FeedInfinite").then((m) => ({
      default: m.FeedInfinite,
    })),
  {
    ssr: false,
    loading: () => (
      <section>
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-b border-border">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3 w-28 animate-pulse rounded bg-surface-overlay" />
            </div>
            <div className="aspect-[9/16] w-full animate-pulse bg-surface-overlay" />
          </div>
        ))}
      </section>
    ),
  },
);

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
