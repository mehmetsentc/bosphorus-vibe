import nextDynamic from "next/dynamic";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentArea } from "@/components/layout/MainContentArea";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { FeedPrefetcher } from "@/components/layout/FeedPrefetcher";
import { StoriesPrefetcher } from "@/components/layout/StoriesPrefetcher";
import { ProfilePrefetcher } from "@/components/layout/ProfilePrefetcher";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GuestBanner } from "@/components/onboarding/GuestBanner";
import { LegalFooter } from "@/components/layout/LegalFooter";

const MessagesDock = nextDynamic(
  () =>
    import("@/components/messages/MessagesDock").then((m) => ({
      default: m.MessagesDock,
    })),
  { ssr: false },
);

const NotificationsPushListener = nextDynamic(
  () =>
    import("@/components/notifications/NotificationsPushListener").then((m) => ({
      default: m.NotificationsPushListener,
    })),
  { ssr: false },
);

/** Main app shell uses client auth — keep dynamic for session-aware rendering. */
export const dynamic = "force-dynamic";
export const preferredRegion = ["fra1"];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RoutePrefetcher />
      <FeedPrefetcher />
      <StoriesPrefetcher />
      <ProfilePrefetcher />
      <NavigationProgress />
      <AuthGuard>
        <div className="min-h-screen md:pl-[244px]">
          <NotificationsPushListener />
          <SidebarNav />
          <GuestBanner />
          <MainContentArea>{children}</MainContentArea>
          <BottomNav />
          <MessagesDock />
          <LegalFooter className="hidden border-t border-border md:block" />
        </div>
      </AuthGuard>
    </>
  );
}
