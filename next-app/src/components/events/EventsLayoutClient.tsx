"use client";

import { WorldCupDailyPopup } from "@/components/events/WorldCupDailyPopup";

export function EventsLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorldCupDailyPopup />
      {children}
    </>
  );
}
