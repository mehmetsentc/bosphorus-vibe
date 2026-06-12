"use client";

import { useEffect, useState } from "react";

export type NetworkTier = "slow" | "fast";

type NetworkConnection = {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
};

function getConnection(): NetworkConnection | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkConnection }).connection;
}

function detectTier(): NetworkTier {
  const conn = getConnection();
  if (!conn) return "fast";

  if (conn.saveData) return "slow";

  const effectiveType = conn.effectiveType ?? "";
  if (
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g"
  ) {
    return "slow";
  }

  if (typeof conn.downlink === "number") {
    if (conn.downlink < 2.5) return "slow";
    if (conn.downlink >= 5) return "fast";
  }

  if (typeof conn.rtt === "number" && conn.rtt > 350) return "slow";

  // 4g with moderate throughput — still prefer lighter streams
  if (effectiveType === "4g" && typeof conn.downlink === "number" && conn.downlink < 5) {
    return "slow";
  }

  return "fast";
}

export function useNetworkQuality(): NetworkTier {
  const [tier, setTier] = useState<NetworkTier>(() => detectTier());

  useEffect(() => {
    setTier(detectTier());
    const conn = getConnection();
    if (!conn?.addEventListener) return;

    const update = () => setTier(detectTier());
    conn.addEventListener("change", update);
    return () => {
      conn.removeEventListener?.("change", update);
    };
  }, []);

  return tier;
}

export function getPreloadStrategy(
  tier: NetworkTier,
  isActive: boolean,
): "none" | "metadata" | "auto" {
  if (!isActive) return "none";
  return tier === "slow" ? "metadata" : "auto";
}
