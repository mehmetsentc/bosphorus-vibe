"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import { IconEye, IconInstagram } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import type { TeamMemberDoc } from "@/types";

type EventsMembersHeaderProps = {
  members: TeamMemberDoc[];
  activeOnly: boolean;
  onToggleActiveOnly: () => void;
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function EventsMembersHeader({
  members,
  activeOnly,
  onToggleActiveOnly,
}: EventsMembersHeaderProps) {
  const t = useT();
  const visible = activeOnly
    ? members.filter((m) => m.isActiveToday)
    : members;

  return (
    <section className="mb-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold leading-tight">
          {t("membersTitle", { brand: BRAND_NAME })}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={activeOnly ? t("showAllMembers") : t("showActiveToday")}
            aria-pressed={activeOnly}
            onClick={onToggleActiveOnly}
            className={`rounded-lg p-2 transition ${
              activeOnly
                ? "bg-vibe/15 text-vibe"
                : "text-muted hover:text-foreground"
            }`}
          >
            <IconEye size={20} />
          </button>
          <a
            href="https://www.instagram.com/bosphorusvibe/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="rounded-lg border border-vibe/30 bg-vibe/10 p-2 text-vibe transition hover:bg-vibe/20"
          >
            <IconInstagram size={20} />
          </a>
        </div>
      </div>

      <div className="members-scroll mt-4">
        <div className="members-scroll-track">
          {visible.map((member) => (
            <Link
              key={member.id}
              href={`/user/${member.id}`}
              title={member.name}
              className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 transition active:opacity-70"
            >
              <div className="rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark p-[2px] transition hover:ring-2 hover:ring-vibe/40">
                <div className="rounded-full bg-background p-[2px]">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      className="h-[62px] w-[62px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-surface-overlay text-lg font-bold text-gold">
                      {member.name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="max-w-[76px] truncate text-center text-[11px] leading-tight">
                {firstName(member.name)}
              </span>
            </Link>
          ))}
          {!visible.length && (
            <p className="py-4 text-sm text-muted">{t("noMembers")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
