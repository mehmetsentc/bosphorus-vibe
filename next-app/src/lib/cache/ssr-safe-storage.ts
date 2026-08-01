import type { StateStorage } from "zustand/middleware";

/** localStorage wrapper that never throws during SSR / prerender. */
export function createSSRSafeLocalStorage(): StateStorage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
}
