"use client";

import { useSettingsOptional } from "@/components/settings/SettingsProvider";
import { useNetworkQuality, type NetworkTier } from "@/lib/hooks/useNetworkQuality";
import type { MediaQualityPref } from "@/lib/settings/preferences";

export function useEffectiveNetworkTier(): NetworkTier {
  const network = useNetworkQuality();
  const settings = useSettingsOptional();
  const quality: MediaQualityPref = settings?.prefs.mediaQuality ?? "auto";

  if (quality === "high") return "fast";
  if (quality === "low") return "slow";
  return network;
}

export function useHideLikeCounts(): boolean {
  const settings = useSettingsOptional();
  return settings?.prefs.hideLikeCounts ?? false;
}

export function useCommentsAllowed(): boolean {
  const settings = useSettingsOptional();
  return settings?.prefs.allowComments !== "off";
}
