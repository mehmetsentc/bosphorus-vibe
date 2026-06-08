"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  getPostImageUrl,
  getPostCaption,
  getPostVideoUrl,
} from "@/lib/services/firestore";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

export function FeedPreview({ posts }: { posts: EnrichedPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 font-display text-lg font-semibold">Latest Posts</h2>
      <div className="space-y-4">
        {posts.slice(0, 5).map((post, i) => {
          const image = getPostImageUrl(post);
          const video = getPostVideoUrl(post);
          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/post/${post.id}`}
                className="block overflow-hidden rounded-2xl border border-border bg-surface-card transition hover:border-gold/30"
              >
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={getPostCaption(post)}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              {!image && video && (
                <video
                  src={video}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-xs text-gold">@{post.userName ?? "user"}</p>
                <p className="mt-1 font-medium">{getPostCaption(post)}</p>
                {post.activityName && (
                  <p className="mt-1 text-xs text-white/40">{post.activityName}</p>
                )}
                <p className="mt-2 text-xs text-muted">
                  {post.likedByIds.length} likes · {post.numComments} comments
                </p>
              </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
