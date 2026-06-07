"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { AdaptiveVideo } from "@/components/video/AdaptiveVideo";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

export function ReelsPreview({ posts }: { posts: EnrichedPost[] }) {
  const t = useT();
  const preview = posts.slice(0, 12);

  if (!preview.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t("navReels")}</h2>
        <Link href="/reels" className="text-sm font-medium text-gold">
          {t("seeAll")}
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
        <div className="flex gap-3">
          {preview.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="shrink-0"
            >
              <Link
                href={`/post/${post.id}`}
                className="group flex w-[76px] flex-col items-center gap-2 sm:w-[84px]"
              >
                <div className="rounded-full bg-gradient-to-br from-gold via-vibe to-gold p-[2px] transition group-active:scale-95">
                  <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-surface-overlay sm:h-[76px] sm:w-[76px]">
                    <AdaptiveVideo
                      post={post}
                      loop
                      className="pointer-events-none h-full w-full object-cover"
                    />
                  </div>
                </div>
                <span className="max-w-[76px] truncate text-center text-[11px] text-muted group-hover:text-foreground sm:max-w-[84px]">
                  @{post.userName ?? "user"}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
