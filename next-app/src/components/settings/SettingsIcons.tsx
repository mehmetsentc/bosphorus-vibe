import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function s({ size = 24, className, ...props }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...props,
  };
}

export function SiArchive(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

export function SiActivity(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M4 18l4-8 4 4 4-10 4 14" />
    </svg>
  );
}

export function SiBell(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

export function SiClock(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function SiLock(p: P) {
  return (
    <svg {...s(p)}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export function SiStar(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 3l2.4 5.5L20 9.5l-4.5 3.5L17 19l-5-3-5 3 1.5-6L4 9.5l5.6-1L12 3z" />
    </svg>
  );
}

export function SiBlock(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function SiAt(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v2a4 4 0 01-8 0V8a4 4 0 018 0v1a3 3 0 006 1" />
    </svg>
  );
}

export function SiComment(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M21 12c0 4-4 7-9 7l-4 3 1-4C5 16 3 14 3 12c0-4 4-7 9-7s9 3 9 7z" />
    </svg>
  );
}

export function SiShare(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5l6.8-3.5M8.6 13.5l6.8 3.5" />
    </svg>
  );
}

export function SiMute(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M18 16v-5a6 6 0 00-9.5-4.9" />
      <path d="M6 16v-5l2-2v-1a6 6 0 011.2-3.6" />
      <path d="M10 20a2 2 0 004 0M3 3l18 18" />
    </svg>
  );
}

export function SiPlay(p: P) {
  return (
    <svg {...s(p)}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiHeartOff(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 21s-6-3.6-8.5-8C2.5 10 4.5 7 7.5 7c1.5 0 2.5.8 3 1.8" />
      <path d="M12 21s6-3.6 8.5-8c1-2-1-5-4-5-1.5 0-2.5.8-3 1.8" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

export function SiPhone(p: P) {
  return (
    <svg {...s(p)}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function SiDownload(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 4v10M8 10l4 4 4-4" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function SiAccessibility(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="4" r="2" />
      <path d="M7 8h10M12 6v8M9 20l3-6 3 6" />
    </svg>
  );
}

export function SiLanguage(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M4 5h8M8 5v14M4 12h8" />
      <path d="M14 8h6M17 5v14M14 19h6" />
    </svg>
  );
}

export function SiQuality(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M4 18V6M8 18V10M12 18V8M16 18V12M20 18V4" />
    </svg>
  );
}

export function SiWeb(p: P) {
  return (
    <svg {...s(p)}>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function SiHelp(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 015 1c0 2-2.5 1.5-2.5 4" />
      <path d="M12 17h.01" strokeWidth="2.5" />
    </svg>
  );
}

export function SiShield(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 3l8 4v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z" />
    </svg>
  );
}

export function SiUser(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
    </svg>
  );
}

export function SiInfo(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" strokeWidth="2.5" />
    </svg>
  );
}

export function SiTheme(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 3a9 9 0 109 9 7 7 0 01-9-9z" />
    </svg>
  );
}

export function SiWords(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M4 7h16M4 12h10M4 17h14" />
      <path d="M18 12l2 2-4 4" />
    </svg>
  );
}

export function SiFriends(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.5-5 6-5" />
      <path d="M16 11h5M18.5 8.5v5" />
    </svg>
  );
}

export function SiRestrict(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3 2.5-5 6-5" />
      <path d="M18 6l4 4" />
    </svg>
  );
}

export function SiLimit(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 3a9 9 0 019 9" />
      <path d="M12 7v5l3 2" />
      <path d="M3 12h2M5 7l1.5 1.5" />
    </svg>
  );
}

export function SiFavorites(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M12 3l2.4 5.5L20 9.5l-4.5 3.5L17 19l-5-3-5 3 1.5-6L4 9.5l5.6-1L12 3z" />
    </svg>
  );
}

export function SiSettings(p: P) {
  return (
    <svg {...s(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function SiLogout(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M10 6H6a2 2 0 00-2 2v8a2 2 0 002 2h4" />
      <path d="M14 12H8M14 12l-2-2M14 12l-2 2" />
    </svg>
  );
}

export function SiCard(p: P) {
  return (
    <svg {...s(p)}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function SiMessage(p: P) {
  return (
    <svg {...s(p)}>
      <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
