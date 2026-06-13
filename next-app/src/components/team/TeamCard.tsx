"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { TeamMemberDoc } from "@/types";
import { formatBrandText } from "@/lib/brand";
import { useT } from "@/components/providers/I18nProvider";

export function TeamCard({
  member,
  index,
}: {
  member: TeamMemberDoc;
  index: number;
}) {
  const t = useT();

  return (
    <Link href={`/user/${member.id}`}>
      <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a]"
    >
      <div className="relative aspect-square">
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#242424] text-4xl font-bold text-gold">
            {member.name[0]}
          </div>
        )}
        {member.isActiveToday && (
          <span className="absolute left-3 top-3 rounded-full gold-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
            {t("todayActive")}
          </span>
        )}
      </div>
      <div className="bg-[#1a1a1a] p-4">
        <h3 className="font-display text-base font-semibold text-white">
          {member.name}
        </h3>
        <p className="text-sm font-medium text-gold">
          {formatBrandText(member.title || member.role)}
        </p>
        {member.bio && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
            {member.bio}
          </p>
        )}
      </div>
    </motion.article>
    </Link>
  );
}
