"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { getTeamMembers } from "@/lib/services/firestore";
import { useAppStore } from "@/store/appStore";
import type { TeamMemberDoc } from "@/types";

export function useTeamMembers() {
  const hydrated = useStoreHydration();
  const team = useAppStore((s) => s.team);
  const lastFetched = useAppStore((s) => s.lastFetched.team);
  const setTeamCache = useAppStore((s) => s.setTeamCache);
  const clearTeamCache = useAppStore((s) => s.clearTeamCache);

  const fetchRef = useRef(0);
  const [fetching, setFetching] = useState(false);

  const hasValidCache =
    hydrated && team !== null && !isCacheExpired(lastFetched);

  const fetchTeam = useCallback(
    async (force = false) => {
      if (!force && team && !isCacheExpired(lastFetched)) return;

      const requestId = ++fetchRef.current;
      const isInitial = !team;
      if (isInitial) setFetching(true);

      try {
        const members = await getTeamMembers();
        if (requestId !== fetchRef.current) return;
        setTeamCache(members);
      } finally {
        if (requestId === fetchRef.current) setFetching(false);
      }
    },
    [team, lastFetched, setTeamCache],
  );

  useEffect(() => {
    if (!hydrated) return;
    void fetchTeam(false);
  }, [hydrated, fetchTeam]);

  const refresh = useCallback(async () => {
    clearTeamCache();
    await fetchTeam(true);
  }, [clearTeamCache, fetchTeam]);

  return {
    team: team ?? ([] as TeamMemberDoc[]),
    loading: hydrated && !hasValidCache && fetching,
    hasCache: hasValidCache,
    refresh,
  };
}
