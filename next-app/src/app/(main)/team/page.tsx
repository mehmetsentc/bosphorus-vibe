"use client";

import { TeamPageSkeleton } from "@/components/ui/SkeletonLoader";
import { PageShell } from "@/components/layout/PageShell";
import { TeamCard } from "@/components/team/TeamCard";
import { useTeamMembers } from "@/lib/hooks/useTeamMembers";
import { useT } from "@/components/providers/I18nProvider";

export default function TeamPage() {
  const t = useT();
  const { team, loading, error, refresh } = useTeamMembers();

  return (
    <PageShell className="py-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("ourTeam")}
          </h1>
          <p className="text-sm text-muted">{t("teamSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold/40 hover:text-foreground disabled:opacity-50"
        >
          {t("reload")}
        </button>
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

      {!loading && error && (
        <p className="py-16 text-center text-muted">
          Ekip yüklenemedi.{" "}
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-gold underline"
          >
            Tekrar dene
          </button>
        </p>
      )}

      {!loading && !error && !team.length && (
        <p className="py-16 text-center text-muted">{t("noTeamAnimation")}</p>
      )}
    </PageShell>
  );
}
