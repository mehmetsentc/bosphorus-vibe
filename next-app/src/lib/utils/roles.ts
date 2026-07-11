import { TEAM_ROLES } from "@/types";

/** Profile roles users can self-select or admins can assign. */
export const PROFILE_ROLES = [
  "user",
  "Animation Team",
  "Hotel Guest",
  "Others",
  "Porty Club Animation Team",
] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

/** Roles an admin can assign from the panel. */
export const ASSIGNABLE_ROLES = [
  "user",
  "admin",
  "Animation Team",
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
  "Animation Team": "Animasyon Takımı",
  "Porty Club Animation Team": "Animasyon Takımı",
  "Hotel Guest": "Otel Misafiri",
  Others: "Diğer",
};

export function isAnimationTeamRole(role?: string | null): boolean {
  if (!role) return false;
  return (TEAM_ROLES as readonly string[]).includes(role);
}

export function isAdminRole(role?: string | null): boolean {
  return role === "admin";
}

export function isProfileRole(role?: string | null): role is ProfileRole {
  if (!role) return false;
  return (PROFILE_ROLES as readonly string[]).includes(role);
}

export function getRoleDisplayLabel(
  role?: string | null,
  opts?: { isAnonymous?: boolean },
): string {
  if (opts?.isAnonymous) return "Anonim Misafir";
  if (!role || role === "user") return ROLE_LABELS.user;
  return ROLE_LABELS[role] ?? role;
}

export function getRoleBadgeClass(
  role?: string | null,
  opts?: { isAnonymous?: boolean },
): string {
  if (opts?.isAnonymous) return "bg-sky-500/15 text-sky-300";
  if (role === "admin") return "bg-gold/20 text-gold";
  if (isAnimationTeamRole(role)) return "bg-violet-500/15 text-violet-300";
  if (role === "Hotel Guest") return "bg-emerald-500/15 text-emerald-300";
  if (role === "Others") return "bg-white/10 text-white/70";
  return "admin-muted bg-white/10";
}

export function matchesAdminRoleFilter(
  role: string,
  filter: AdminUserRoleFilter,
  isAnonymous = false,
): boolean {
  if (filter === "all") return true;
  if (filter === "anonymous") return isAnonymous;
  if (filter === "admin") return role === "admin";
  if (filter === "animation") return isAnimationTeamRole(role);
  if (filter === "guest") return role === "Hotel Guest";
  if (filter === "others") return role === "Others";
  if (filter === "member") {
    return !isAnonymous && role !== "admin" && !isAnimationTeamRole(role) && role !== "Hotel Guest" && role !== "Others";
  }
  return true;
}

export function roleSelectOptions(currentRole?: string | null): string[] {
  const options: string[] = [...ASSIGNABLE_ROLES];
  if (currentRole && !options.includes(currentRole)) {
    options.push(currentRole);
  }
  return options;
}
