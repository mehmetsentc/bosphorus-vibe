"use client";

import type { ComponentType, SVGProps } from "react";

type ProfileTabsProps = {
  tabs: {
    id: string;
    icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
    label: string;
  }[];
  active: string;
  onChange: (id: string) => void;
};

export function ProfileTabs({ tabs, active, onChange }: ProfileTabsProps) {
  return (
    <div className="flex">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(id)}
            className={`relative flex flex-1 items-center justify-center py-3 ${
              isActive ? "text-foreground" : "text-muted"
            }`}
          >
            <Icon size={22} />
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
