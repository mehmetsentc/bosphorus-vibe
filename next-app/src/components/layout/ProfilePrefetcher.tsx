"use client";

import { useEffect } from "react";
import { prefetchOwnProfile } from "@/lib/cache/profile-prefetch";
import { useAuth } from "@/components/providers/AuthProvider";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";

export function ProfilePrefetcher() {
  const hydrated = useStoreHydration();
  const { user } = useAuth();

  useEffect(() => {
    if (!hydrated || !user?.uid || user.isAnonymous) return;
    void prefetchOwnProfile();
  }, [hydrated, user?.uid, user?.isAnonymous]);

  return null;
}
