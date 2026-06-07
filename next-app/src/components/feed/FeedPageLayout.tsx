"use client";

import type { ReactNode } from "react";
import { FeedRightSidebar } from "@/components/feed/FeedRightSidebar";

type FeedPageLayoutProps = {
  children: ReactNode;
};

export function FeedPageLayout({ children }: FeedPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-[935px] justify-center gap-8 pt-4 xl:max-w-[1135px] xl:gap-20">
      <div className="w-full min-w-0 max-w-[470px] shrink-0">{children}</div>
      <aside className="sticky top-8 hidden h-fit w-[320px] shrink-0 lg:block">
        <FeedRightSidebar />
      </aside>
    </div>
  );
}
