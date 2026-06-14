import { AuthGuard } from "@/components/providers/AuthGuard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentArea } from "@/components/layout/MainContentArea";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { ReelsPrefetcher } from "@/components/layout/ReelsPrefetcher";
import { FeedPrefetcher } from "@/components/layout/FeedPrefetcher";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GuestBanner } from "@/components/onboarding/GuestBanner";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { MessagesDock } from "@/components/messages/MessagesDock";

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
      <ReelsPrefetcher />
      <NavigationProgress />
      <AuthGuard>
        <div className="min-h-screen md:pl-[244px]">
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
