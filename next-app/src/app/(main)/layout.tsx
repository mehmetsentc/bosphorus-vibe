import nextDynamic from "next/dynamic";
import { cookies } from "next/headers";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentArea } from "@/components/layout/MainContentArea";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { FeedPrefetcher } from "@/components/layout/FeedPrefetcher";
import { StoriesPrefetcher } from "@/components/layout/StoriesPrefetcher";
import { ProfilePrefetcher } from "@/components/layout/ProfilePrefetcher";
import { ReelsPrefetcher } from "@/components/layout/ReelsPrefetcher";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GuestBanner } from "@/components/onboarding/GuestBanner";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { ACCESS_COOKIE, type AccessLevel } from "@/lib/session/constants";

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

function readInitialAccess(): AccessLevel | null {
  const value = cookies().get(ACCESS_COOKIE)?.value;
  return value === "guest" || value === "auth" ? value : null;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialAccess = readInitialAccess();

  return (
    <>
      <RoutePrefetcher />
      <FeedPrefetcher />
      <StoriesPrefetcher />
      <ProfilePrefetcher />
      <ReelsPrefetcher />
      <NavigationProgress />
      <AuthGuard initialAccess={initialAccess}>
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
