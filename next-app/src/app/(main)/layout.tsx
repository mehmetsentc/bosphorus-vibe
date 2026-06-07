import { AuthGuard } from "@/components/providers/AuthGuard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentArea } from "@/components/layout/MainContentArea";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GuestBanner } from "@/components/onboarding/GuestBanner";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { MessagesDock } from "@/components/messages/MessagesDock";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RoutePrefetcher />
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
