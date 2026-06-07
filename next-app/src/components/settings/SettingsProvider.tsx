"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addHiddenWord,
  addUserToList,
  DEFAULT_PREFERENCES,
  readPreferences,
  removeHiddenWord,
  removeUserFromList,
  updatePreferences,
  writePreferences,
  type AppPreferences,
  type UserListEntry,
} from "@/lib/settings/preferences";

type SettingsContextValue = {
  prefs: AppPreferences;
  ready: boolean;
  update: (patch: Partial<AppPreferences>) => void;
  addToList: (
    key:
      | "blockedUsers"
      | "mutedUsers"
      | "restrictedUsers"
      | "closeFriends"
      | "spamUsers",
    entry: UserListEntry,
  ) => void;
  removeFromList: (
    key:
      | "blockedUsers"
      | "mutedUsers"
      | "restrictedUsers"
      | "closeFriends"
      | "spamUsers",
    uid: string,
  ) => void;
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readPreferences();
    setPrefs(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("reduce-motion", prefs.reduceMotion);
    document.documentElement.classList.toggle("text-size-large", prefs.textSize === "large");
  }, [prefs.reduceMotion, prefs.textSize, ready]);

  const update = useCallback((patch: Partial<AppPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      writePreferences(next);
      return next;
    });
  }, []);

  const addToList = useCallback(
    (
      key:
        | "blockedUsers"
        | "mutedUsers"
        | "restrictedUsers"
        | "closeFriends"
        | "spamUsers",
      entry: UserListEntry,
    ) => {
      setPrefs((prev) => {
        const list = prev[key].filter((u) => u.uid !== entry.uid);
        const next = { ...prev, [key]: [...list, entry] };
        writePreferences(next);
        return next;
      });
    },
    [],
  );

  const removeFromList = useCallback(
    (
      key:
        | "blockedUsers"
        | "mutedUsers"
        | "restrictedUsers"
        | "closeFriends"
        | "spamUsers",
      uid: string,
    ) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          [key]: prev[key].filter((u) => u.uid !== uid),
        };
        writePreferences(next);
        return next;
      });
    },
    [],
  );

  const addWord = useCallback((word: string) => {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return;
    setPrefs((prev) => {
      if (prev.hiddenWords.includes(trimmed)) return prev;
      const next = { ...prev, hiddenWords: [...prev.hiddenWords, trimmed] };
      writePreferences(next);
      return next;
    });
  }, []);

  const removeWord = useCallback((word: string) => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        hiddenWords: prev.hiddenWords.filter((w) => w !== word),
      };
      writePreferences(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writePreferences(DEFAULT_PREFERENCES);
    setPrefs({ ...DEFAULT_PREFERENCES });
  }, []);

  const value = useMemo(
    () => ({
      prefs,
      ready,
      update,
      addToList,
      removeFromList,
      addWord,
      removeWord,
      reset,
    }),
    [prefs, ready, update, addToList, removeFromList, addWord, removeWord, reset],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function useSettingsOptional() {
  return useContext(SettingsContext);
}
