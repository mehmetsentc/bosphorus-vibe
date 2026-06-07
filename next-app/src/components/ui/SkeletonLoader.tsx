type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-overlay ${className}`}
      aria-hidden
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] w-[76px] shrink-0 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function EventsPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-14 shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-[935px] px-4 py-6">
      <div className="flex gap-6">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex flex-1 justify-around pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-14" />
          ))}
        </div>
      </div>
      <Skeleton className="mt-4 h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-full max-w-sm" />
      <div className="mt-4 grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}

export function ReelsPageSkeleton() {
  return (
    <div className="reels-shell-scroll flex items-center justify-center bg-black">
      <Skeleton className="h-full w-full max-w-md rounded-none opacity-30" />
    </div>
  );
}

export function TeamPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
      ))}
    </div>
  );
}
