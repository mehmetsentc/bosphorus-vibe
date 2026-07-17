"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { getTeamMembers } from "@/lib/services/firestore";
import { useAppStore } from "@/store/appStore";
import type { TeamMemberDoc } from "@/types";

export function useTeamMembers() {
  const hydrated = useStoreHydration();
  const team = useAppStore((s) => s.team);
  const setTeamCache = useAppStore((s) => s.setTeamCache);
  const clearTeamCache = useAppStore((s) => s.clearTeamCache);

  const fetchRef = useRef(0);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  const fetchTeam = useCallback(async () => {
    const requestId = ++fetchRef.current;
    setFetching(true);
    setError(false);

    try {
      const members = await getTeamMembers();
      if (requestId !== fetchRef.current) return;
      setTeamCache(members);
    } catch {
      if (requestId !== fetchRef.current) return;
      setError(true);
    } finally {
      if (requestId === fetchRef.current) setFetching(false);
    }
  }, [setTeamCache]);

  // Always refetch on mount so admin role changes show up immediately
  // (do not trust the 30-minute persisted team cache).
  useEffect(() => {
    if (!hydrated) return;
    clearTeamCache();
    void fetchTeam();
  }, [hydrated, clearTeamCache, fetchTeam]);

  const refresh = useCallback(async () => {
    clearTeamCache();
    await fetchTeam();
  }, [clearTeamCache, fetchTeam]);

  return {
    team: team ?? ([] as TeamMemberDoc[]),
    loading: hydrated && (fetching || team === null) && !error,
    error,
    hasCache: team !== null,
    refresh,
  };
}
