"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

/** Wait until Zustand persist has restored from localStorage */
export function useStoreHydration(): boolean {
  const [ready, setReady] = useState(
    () => useAppStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useAppStore.persist.onFinishHydration(() => {
      setReady(true);
    });
  }, []);

  return ready;
}
