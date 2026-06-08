"use client";

import { ClientProviders } from "@/components/providers/ClientProviders";

export function ClientProvidersLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
