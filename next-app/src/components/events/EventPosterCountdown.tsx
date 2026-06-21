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
      <span className="rounded-full gold-gradient px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-black shadow-lg">
        {t("startingNow")}
      </span>
    );
  }

  const units = [
    { val: time.hours, label: "SA" },
    { val: time.minutes, label: "DK" },
    { val: time.seconds, label: "SN" },
  ];

  return (
    <div
      className={`flex items-center gap-0.5 rounded-2xl shadow-xl ${
        compact
          ? "bg-black/70 px-2.5 py-1.5 backdrop-blur-md"
          : "bg-black/75 px-4 py-2.5 backdrop-blur-lg"
      }`}
    >
      {units.map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-0.5">
          {i > 0 && (
            <span
              className={`font-black text-gold ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span
              className={`font-black tabular-nums leading-none text-white ${
                compact ? "text-base" : "text-2xl"
              }`}
            >
              {pad(val)}
            </span>
            <span
              className={`font-bold uppercase leading-none text-gold/80 ${
                compact ? "text-[7px] mt-0.5" : "text-[8px] mt-1"
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
