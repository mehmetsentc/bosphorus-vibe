import { TEAM_ROLES } from "@/types";

export function isAnimationTeamRole(role?: string | null): boolean {
  if (!role) return false;
  return (TEAM_ROLES as readonly string[]).includes(role);
}
