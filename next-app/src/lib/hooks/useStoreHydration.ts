"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

/** Wait until Zustand persist has restored from localStorage (SSR-safe). */
export function useStoreHydration(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persistApi = useAppStore.persist;
    if (!persistApi?.hasHydrated) {
      setReady(true);
      return;
    }
    if (persistApi.hasHydrated()) {
      setReady(true);
      return;
    }
    return persistApi.onFinishHydration(() => {
      setReady(true);
    });
  }, []);

  return ready;
}
