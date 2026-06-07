"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconMonitor, IconMoon, IconSun } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";

const options = [
  { value: "system", labelKey: "themeSystem" as const, Icon: IconMonitor },
  { value: "light", labelKey: "themeLight" as const, Icon: IconSun },
  { value: "dark", labelKey: "themeDark" as const, Icon: IconMoon },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-10 w-full animate-pulse rounded-xl bg-surface-overlay" />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-card p-1">
      <p className="mb-2 px-2 pt-1 text-xs font-medium text-muted">{t("theme")}</p>
      <div className="grid grid-cols-3 gap-1">
        {options.map(({ value, labelKey, Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-medium transition ${
                active
                  ? "gold-gradient text-black shadow-gold"
                  : "text-muted hover:bg-surface-overlay hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {t(labelKey)}
            </button>
          );
        })}
      </div>
      {resolvedTheme && (
        <p className="mt-2 px-2 pb-1 text-[10px] text-muted">
          {resolvedTheme === "dark" ? t("activeDark") : t("activeLight")}
        </p>
      )}
    </div>
  );
}
