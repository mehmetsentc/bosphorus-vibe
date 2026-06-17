import { AuthGuard } from "@/components/providers/AuthGuard";

/** Admin routes — no main app sidebar / bottom nav */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
