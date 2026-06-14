"use client";

import { PageShell } from "@/components/layout/PageShell";
import { MemberCard } from "@/components/members/MemberCard";
import { TeamPageSkeleton } from "@/components/ui/SkeletonLoader";
import { BRAND_NAME } from "@/lib/brand";
import { useAllMembers } from "@/lib/hooks/useAllMembers";
import { useT } from "@/components/providers/I18nProvider";

export default function MembersPage() {
  const t = useT();
  const { members, following, loading, markFollowing } = useAllMembers();

  return (
    <PageShell className="py-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {t("membersTitle", { brand: BRAND_NAME })}
        </h1>
        <p className="text-sm text-muted">{t("membersPageSubtitle")}</p>
      </header>

      {loading ? (
        <TeamPageSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {members.map((member) => (
            <MemberCard
              key={member.uid}
              user={member}
              isFollowing={following.has(member.uid)}
              onFollowChange={markFollowing}
              from="/members"
            />
          ))}
        </div>
      )}

      {!loading && !members.length && (
        <p className="py-16 text-center text-muted">{t("noMembers")}</p>
      )}
    </PageShell>
  );
}
