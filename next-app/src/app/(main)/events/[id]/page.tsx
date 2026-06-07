import { Suspense } from "react";
import { EventDetailClient } from "./EventDetailClient";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <EventDetailClient id={params.id} />
    </Suspense>
  );
}
