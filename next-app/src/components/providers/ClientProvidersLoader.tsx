"use client";

import dynamic from "next/dynamic";

const ClientProviders = dynamic(
  () =>
    import("@/components/providers/ClientProviders").then((mod) => ({
      default: mod.ClientProviders,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    ),
  },
);

export function ClientProvidersLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
