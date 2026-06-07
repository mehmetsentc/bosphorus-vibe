import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function baseProps({ size = 24, className, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...props,
  };
}

export function IconHeart({ size, filled, className, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path
        d="M12 21s-7.5-4.74-9.5-9.5C1.2 8.2 3.5 5 7 5c2 0 3.2 1.2 4 2.5C11.8 6.2 13 5 15 5c3.5 0 5.8 3.2 4.5 6.5C19.5 16.26 12 21 12 21z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function IconMessage({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M7 9h10M7 13h6" />
      <path d="M21 12c0 3.866-3.582 7-8 7-.89 0-1.74-.13-2.53-.36L3 21l1.36-5.47A7.06 7.06 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
    </svg>
  );
}

export function IconSend({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export function IconShare({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path d="M12 16V4M12 4l4 4M12 4L8 8" />
    </svg>
  );
}

export function IconPlay({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M9 6h2v12H9zM13 6h2v12h-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconVolumeOn({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" />
    </svg>
  );
}

export function IconVolumeOff({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M16 9l5 5M21 9l-5 5" />
    </svg>
  );
}

export function IconSun({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M21 14.5A8.5 8.5 0 1112.5 3a6.5 6.5 0 009.5 11.5z" />
    </svg>
  );
}

export function IconMonitor({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function IconGrid({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconReels({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBookmark({
  size,
  filled,
  className,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path
        d="M6 4h12v16l-6-4-6 4V4z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function IconRepost({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M17 3l4 4-4 4" />
      <path d="M21 7H10a4 4 0 000 8h1" />
      <path d="M7 21l-4-4 4-4" />
      <path d="M3 17h11a4 4 0 000-8h-1" />
    </svg>
  );
}

export function IconTrash({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M10 11v6M14 11v6" />
      <path d="M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12" />
    </svg>
  );
}

export function IconMenu({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconUserPlus({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

export function IconPlus({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconPin({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M12 17v5" />
      <path d="M5 7.5C5 5.01 8.13 3 12 3s7 2.01 7 4.5c0 2.09-1.67 3.84-4 4.35V14l-3 2v1H9v-1l-3-2V11.85C3.67 11.34 2 9.59 2 7.5z" />
    </svg>
  );
}

export function IconTagged({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6 19c0-2.5 2.69-4 6-4s6 1.5 6 4" />
    </svg>
  );
}

export function IconLayers({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M4 16V6a2 2 0 012-2h10" />
    </svg>
  );
}

export function IconMusic({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function IconEye({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconInstagram({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconClock({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconLocation({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconEventBadge({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="2 2" />
    </svg>
  );
}

export function IconEveningShow({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <path d="M12 3c-4 3-6 6-6 9a6 6 0 1012 0c0-3-2-6-6-9z" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function IconDailyActivity({ size, className, ...props }: IconProps) {
  return (
    <svg {...baseProps({ size, className, ...props })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M4 12h16M12 4a12 12 0 010 16M12 4a12 12 0 000 16" />
    </svg>
  );
}
