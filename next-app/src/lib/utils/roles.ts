import { TEAM_ROLES } from "@/types";

/** Canonical English role stored in Firestore. */
export const CANONICAL_ANIMATION_TEAM = "Animation Team";

/**
 * All known spellings that mean Animation Team (EN + TR + legacy brand).
 * Queries and filters must accept every alias; writes normalize to canonical.
 */
export const ANIMATION_TEAM_ALIASES = [
  CANONICAL_ANIMATION_TEAM,
  "Porty Club Animation Team",
  "Bosphorus Vibe Animation Team",
  "Animasyon Takımı",
  "Animasyon Ekibi",
  "Animasyon Takimi",
] as const;

/** Profile roles users can self-select or admins can assign. */
export const PROFILE_ROLES = [
  "user",
  CANONICAL_ANIMATION_TEAM,
  "Hotel Guest",
  "Others",
  "Porty Club Animation Team",
] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

/** Roles an admin can assign from the panel (canonical values only). */
export const ASSIGNABLE_ROLES = [
  "user",
  "admin",
  CANONICAL_ANIMATION_TEAM,
  "Hotel Guest",
  "Others",
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export type AdminUserRoleFilter =
  | "all"
  | "admin"
  | "animation"
  | "guest"
  | "member"
  | "anonymous"
  | "others";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  user: "Üye",
  [CANONICAL_ANIMATION_TEAM]: "Animasyon Takımı",
  "Porty Club Animation Team": "Animasyon Takımı",
  "Bosphorus Vibe Animation Team": "Animasyon Takımı",
  "Animasyon Takımı": "Animasyon Takımı",
  "Animasyon Ekibi": "Animasyon Takımı",
  "Animasyon Takimi": "Animasyon Takımı",
  "Hotel Guest": "Otel Misafiri",
  Others: "Diğer",
};

const ALIAS_LOOKUP = new Map(
  ANIMATION_TEAM_ALIASES.map((a) => [a.toLowerCase(), a] as const),
);

export function isExactAnimationTeamAlias(role?: string | null): boolean {
  if (!role) return false;
  const trimmed = role.trim();
  if (!trimmed) return false;
  if ((TEAM_ROLES as readonly string[]).includes(trimmed)) return true;
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  return ALIAS_LOOKUP.has(trimmed.toLowerCase()) || ALIAS_LOOKUP.has(key);
}

export function isAnimationTeamRole(role?: string | null): boolean {
  if (!role) return false;
  const trimmed = role.trim();
  if (!trimmed) return false;
  // Admin never counts as animation team (check before alias / loose match).
  if (trimmed === "admin" || trimmed === "Admin") return false;
  if (isExactAnimationTeamAlias(trimmed)) return true;
  const loose = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ");
  // Only treat short role-like strings as animation (avoid matching long bios).
  if (loose.length > 48) return false;
  return (
    (loose.includes("animasyon") || loose.includes("animation")) &&
    (loose.includes("takim") || loose.includes("team") || loose.includes("ekip"))
  );
}

/** Map any known alias to the canonical Firestore role value. */
export function normalizeRole(role?: string | null): string {
  if (!role) return "user";
  const trimmed = role.trim();
  // Admin before animation so isAnimationTeamRole can rely on admin never matching.
  if (trimmed === "admin" || trimmed === "Admin") return "admin";
  if (isAnimationTeamRole(trimmed)) return CANONICAL_ANIMATION_TEAM;
  if (trimmed === "Hotel Guest" || trimmed === "Otel Misafiri") return "Hotel Guest";
  if (trimmed === "Others" || trimmed === "Diğer" || trimmed === "Diger") return "Others";
  if (trimmed === "user" || trimmed === "Üye" || trimmed === "Uye") return "user";
  return trimmed;
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === "admin";
}

export function isProfileRole(role?: string | null): role is ProfileRole {
  if (!role) return false;
  const n = normalizeRole(role);
  return (PROFILE_ROLES as readonly string[]).includes(n);
}

export function getRoleDisplayLabel(
  role?: string | null,
  opts?: { isAnonymous?: boolean },
): string {
  if (opts?.isAnonymous) return "Anonim Misafir";
  if (!role || role === "user") return ROLE_LABELS.user;
  if (isAnimationTeamRole(role)) return ROLE_LABELS[CANONICAL_ANIMATION_TEAM];
  return ROLE_LABELS[role] ?? ROLE_LABELS[normalizeRole(role)] ?? role;
}

export function getRoleBadgeClass(
  role?: string | null,
  opts?: { isAnonymous?: boolean },
): string {
  if (opts?.isAnonymous) return "bg-sky-500/15 text-sky-300";
  if (isAdminRole(role)) return "bg-gold/20 text-gold";
  if (isAnimationTeamRole(role)) return "bg-violet-500/15 text-violet-300";
  if (normalizeRole(role) === "Hotel Guest") return "bg-emerald-500/15 text-emerald-300";
  if (normalizeRole(role) === "Others") return "bg-white/10 text-white/70";
  return "admin-muted bg-white/10";
}

export function matchesAdminRoleFilter(
  role: string,
  filter: AdminUserRoleFilter,
  isAnonymous = false,
): boolean {
  const n = normalizeRole(role);
  if (filter === "all") return true;
  if (filter === "anonymous") return isAnonymous;
  if (filter === "admin") return n === "admin";
  if (filter === "animation") return isAnimationTeamRole(role);
  if (filter === "guest") return n === "Hotel Guest";
  if (filter === "others") return n === "Others";
  if (filter === "member") {
    return (
      !isAnonymous &&
      n !== "admin" &&
      !isAnimationTeamRole(role) &&
      n !== "Hotel Guest" &&
      n !== "Others"
    );
  }
  return true;
}

export function roleSelectOptions(currentRole?: string | null): string[] {
  const options: string[] = [...ASSIGNABLE_ROLES];
  if (!currentRole) return options;
  const n = normalizeRole(currentRole);
  if (!options.includes(n) && !isAnimationTeamRole(currentRole)) {
    options.push(n);
  }
  return options;
}

/** Select value for admin dropdown — always canonical English. */
export function roleSelectValue(currentRole?: string | null): string {
  if (!currentRole) return "user";
  if (isAnimationTeamRole(currentRole)) return CANONICAL_ANIMATION_TEAM;
  return normalizeRole(currentRole);
}
