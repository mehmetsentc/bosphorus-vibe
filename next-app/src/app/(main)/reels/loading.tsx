import { ReelsShell } from "@/components/reels/ReelsShell";
import { ReelsPageSkeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <ReelsShell>
      <ReelsPageSkeleton />
    </ReelsShell>
  );
}
