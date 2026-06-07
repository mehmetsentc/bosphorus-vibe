"use client";

import { useEffect, useState } from "react";
import { getCountdown, pad } from "@/lib/utils/time";
import { useT } from "@/components/providers/I18nProvider";

type EventPosterCountdownProps = {
  target: Date;
  compact?: boolean;
};

export function EventPosterCountdown({
  target,
  compact = false,
}: EventPosterCountdownProps) {
  const t = useT();
  const [time, setTime] = useState(getCountdown(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.expired) {
    return (
      <span className="rounded-full bg-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
        {t("startingNow")}
      </span>
    );
  }

  const units = [
    { val: time.hours, label: "h" },
    { val: time.minutes, label: "m" },
    { val: time.seconds, label: "s" },
  ];

  return (
    <div
      className={`flex items-center gap-1 rounded-xl bg-black/55 backdrop-blur-md ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      }`}
    >
      {units.map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-1">
          {i > 0 && (
            <span className="text-xs font-bold text-white/50">:</span>
          )}
          <div className="flex flex-col items-center">
            <span
              className={`font-bold tabular-nums text-gold ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {pad(val)}
            </span>
            <span className="text-[8px] uppercase text-white/45">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
