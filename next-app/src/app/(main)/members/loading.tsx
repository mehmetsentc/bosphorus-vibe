import { PageShell } from "@/components/layout/PageShell";
import { TeamPageSkeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <PageShell className="py-6">
      <TeamPageSkeleton />
    </PageShell>
  );
}
