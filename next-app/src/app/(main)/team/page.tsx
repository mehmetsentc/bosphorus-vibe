"use client";

import { useEffect, useState } from "react";
import { getTeamMembers } from "@/lib/services/firestore";
import { TeamPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PageShell } from "@/components/layout/PageShell";
import { TeamCard } from "@/components/team/TeamCard";
import { useT } from "@/components/providers/I18nProvider";
import type { TeamMemberDoc } from "@/types";

export default function TeamPage() {
  const t = useT();
  const [team, setTeam] = useState<TeamMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamMembers().then(setTeam).finally(() => setLoading(false));
  }, []);

  return (
    <PageShell className="py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold">{t("ourTeam")}</h1>
        <p className="text-sm text-white/40">{t("teamSubtitle")}</p>
      </header>

      {loading ? (
        <TeamPageSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {team.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>
      )}

      {!loading && !team.length && (
        <p className="py-16 text-center text-white/40">
          {t("noTeamAnimation")}
        </p>
      )}
    </PageShell>
  );
}
