"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import {
  getPostVideoPoster,
  getVideoReelsPath,
  prefetchImageUrls,
} from "@/lib/utils/video-sources";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

export function ReelsPreview({ posts }: { posts: EnrichedPost[] }) {
  const t = useT();
  const preview = useMemo(() => posts.slice(0, 12), [posts]);

  useEffect(() => {
    const posters = preview
      .map((post) => getPostVideoPoster(post))
      .filter(Boolean) as string[];
    prefetchImageUrls(posters.slice(0, 6));
  }, [preview]);

  if (!preview.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t("navReels")}</h2>
        <Link href="/home" className="text-sm font-medium text-gold">
          {t("seeAll")}
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
        <div className="flex gap-3">
          {preview.map((post, i) => {
            const poster = getPostVideoPoster(post);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="shrink-0"
              >
                <Link
                  href={getVideoReelsPath(post.id)}
                  className="group flex w-[76px] flex-col items-center gap-2 sm:w-[84px]"
                >
                  <div className="rounded-full bg-gradient-to-br from-gold via-vibe to-gold p-[2px] transition group-active:scale-95">
                    <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-surface-overlay sm:h-[76px] sm:w-[76px]">
                      {poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={poster}
                          alt=""
                          className="pointer-events-none h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-surface-card" />
                      )}
                    </div>
                  </div>
                  <span className="max-w-[76px] truncate text-center text-[11px] text-muted group-hover:text-foreground sm:max-w-[84px]">
                    @{post.userName ?? "user"}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
