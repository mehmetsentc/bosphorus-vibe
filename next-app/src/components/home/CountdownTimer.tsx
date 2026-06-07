"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCountdown, pad } from "@/lib/utils/time";
import { useT } from "@/components/providers/I18nProvider";

export function CountdownTimer({ target }: { target: Date }) {
  const t = useT();
  const [time, setTime] = useState(getCountdown(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.expired) {
    return (
      <span className="text-sm font-medium text-gold-light">{t("startingNow")}</span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      {[
        { val: time.hours, label: "h" },
        { val: time.minutes, label: "m" },
        { val: time.seconds, label: "s" },
      ].map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-vibe/20 bg-surface-overlay text-lg font-bold text-vibe shadow-vibe-sm">
            {pad(val)}
          </span>
          <span className="mt-0.5 text-[10px] text-white/40">{label}</span>
        </div>
      ))}
    </motion.div>
  );
}
