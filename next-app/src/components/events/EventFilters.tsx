"use client";

import { motion } from "framer-motion";
import { useT } from "@/components/providers/I18nProvider";

export function EventFilters({
  active,
  categories,
  onChange,
}: {
  active: string;
  categories: string[];
  onChange: (cat: string) => void;
}) {
  const t = useT();
  const filters = [{ value: "all", label: t("all") }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((f) => (
        <motion.button
          key={f.value}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => onChange(f.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === f.value
              ? "gold-gradient text-black shadow-gold"
              : "border border-white/5 bg-surface-overlay text-white/60 hover:border-vibe/30 hover:text-vibe-light"
          }`}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}
