"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPostById,
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
  enrichPostsWithUsers,
} from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { IconMenu } from "@/components/icons/Icons";
import { PageShell } from "@/components/layout/PageShell";
import { PostManageModal } from "@/components/post/PostManageModal";
import { PostActionsBar } from "@/components/post/PostActionsBar";
import { PostCommentModal } from "@/components/post/PostCommentModal";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <PostDetailContent id={params.id} />
    </Suspense>
  );
}

function PostDetailContent({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { dateLocale } = useI18n();
  const backHref = searchParams.get("from");
  const [post, setPost] = useState<
    (UserPostDoc & { userName?: string; userPhoto?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    getPostById(id)
      .then(async (p) => {
        if (!p) return null;
        const [enriched] = await enrichPostsWithUsers([p]);
        return enriched;
      })
      .then((p) => {
        if (!p) {
          router.replace("/profile");
          return;
        }
        setPost(p);
        setCommentCount(p.numComments);
      })
      .finally(() => setLoading(false));
  }, [id, user, router]);

  async function reloadPost() {
    const p = await getPostById(id);
    if (!p) {
      router.replace("/profile");
      return;
    }
    const [enriched] = await enrichPostsWithUsers([p]);
    setPost(enriched);
    setCommentCount(enriched.numComments);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!post) return null;

  const videoUrl = getPostVideoUrl(post);
  const imageUrl = getPostImageUrl(post);
  const caption = getPostCaption(post);
  const isOwner = Boolean(user && post.postUserId === user.uid);

  return (
    <PageShell className="pb-8">
      <div className="flex items-center justify-between gap-3 py-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-overlay text-lg transition hover:bg-surface-card"
            aria-label={t("back")}
          >
            ←
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted hover:text-foreground"
          >
            ← {t("back")}
          </button>
        )}
        {isOwner && (
          <button
            type="button"
            aria-label={t("managePost")}
            onClick={() => setManageOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2 text-sm text-muted transition hover:text-foreground"
          >
            <IconMenu size={16} />
            {t("managePost")}
          </button>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="relative mx-auto aspect-[9/16] w-full max-h-[75vh] max-w-md bg-black lg:max-h-[85vh] lg:sticky lg:top-4">
          {videoUrl ? (
            <VideoPlayer post={post} isActive showSeekBar />
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={caption} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-white/40">
              {t("noContent")}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3 lg:mt-0">
          <div className="flex items-center gap-3">
            {post.userPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.userPhoto}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-overlay text-gold">
                {(post.userName ?? "?")[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{post.userName ?? t("user")}</p>
              <p className="text-xs text-muted">
                {post.timePosted.toLocaleDateString(dateLocale)}
              </p>
            </div>
          </div>

          {caption && <p className="text-sm text-foreground/90">{caption}</p>}
          {post.activityName && (
            <p className="text-xs text-gold">{post.activityName}</p>
          )}

          <PostActionsBar
            post={{ ...post, numComments: commentCount }}
            onCommentClick={() => setCommentOpen(true)}
          />

          {post.postUserId && (
            <Link
              href="/profile"
              className="inline-block text-sm text-gold hover:underline"
            >
              {t("goToProfile")}
            </Link>
          )}
        </div>
      </div>

      <PostCommentModal
        postId={post.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        onCommentAdded={setCommentCount}
        initialCount={commentCount}
      />

      <PostManageModal
        post={post}
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        onUpdated={reloadPost}
        onDeleted={() => router.replace("/profile")}
      />
    </PageShell>
  );
}
