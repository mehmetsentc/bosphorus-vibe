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

  if (typeof conn.downlink === "number") {
    if (conn.downlink < 1.5) return "slow";
    if (conn.downlink >= 4) return "fast";
  }

  if (typeof conn.rtt === "number" && conn.rtt > 450) return "slow";

  const effectiveType = conn.effectiveType ?? "";
  if (effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g") {
    return "slow";
  }

  return "fast";
}

export function useNetworkQuality(): NetworkTier {
  const [tier, setTier] = useState<NetworkTier>("fast");

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
  if (!isActive) return "metadata";
  return tier === "slow" ? "metadata" : "auto";
}
