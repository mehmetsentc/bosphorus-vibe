"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isCacheExpired } from "@/lib/cache/constants";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import { getEventsBySections } from "@/lib/services/firestore";
import { useAppStore } from "@/store/appStore";
import type { EventDoc } from "@/types";

export function useEvents() {
  const hydrated = useStoreHydration();
  const events = useAppStore((s) => s.events);
  const lastFetched = useAppStore((s) => s.lastFetched.events);
  const setEvents = useAppStore((s) => s.setEvents);
  const clearEventsCache = useAppStore((s) => s.clearEventsCache);

  const fetchRef = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);

  const hasValidCache =
    hydrated && events !== null && !isCacheExpired(lastFetched);

  const fetchEvents = useCallback(
    async (force = false) => {
      if (!force && events && !isCacheExpired(lastFetched)) {
        return;
      }

      const requestId = ++fetchRef.current;
      const isInitial = !events;
      if (force) setRefreshing(true);
      else if (isInitial) setFetching(true);

      try {
        const { daily, showTime } = await getEventsBySections();
        if (requestId !== fetchRef.current) return;
        setEvents({ daily, showTime });
      } finally {
        if (requestId === fetchRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [events, lastFetched, setEvents],
  );

  useEffect(() => {
    if (!hydrated) return;
    void fetchEvents(false);
  }, [hydrated, fetchEvents]);

  const refresh = useCallback(async () => {
    clearEventsCache();
    await fetchEvents(true);
  }, [clearEventsCache, fetchEvents]);

  return {
    dailyEvents: events?.daily ?? ([] as EventDoc[]),
    showTimeEvents: events?.showTime ?? ([] as EventDoc[]),
    loading: hydrated && !hasValidCache && fetching,
    refreshing,
    hasCache: hasValidCache,
    refresh,
  };
}
