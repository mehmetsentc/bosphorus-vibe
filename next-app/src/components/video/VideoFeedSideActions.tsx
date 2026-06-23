"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteUserPost,
  getPostCaption,
  repostUserPost,
  toggleLike,
  toggleSavePost,
} from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { triggerGuestModal } from "@/lib/hooks/useGuestModal";
import {
  IconBookmark,
  IconHeart,
  IconMessage,
  IconRepost,
  IconShare,
  IconTrash,
} from "@/components/icons/Icons";
import { ShareSheet } from "@/components/share/ShareSheet";
import { ShareToStoryButton } from "@/components/stories/ShareToStoryButton";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { buildPostSharePayload } from "@/lib/utils/share-post";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type EnrichedPost = UserPostDoc & { userName?: string; userPhoto?: string };

type VideoFeedSideActionsProps = {
  post: EnrichedPost;
  onCommentClick?: () => void;
  onPostDeleted?: () => void;
};

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-1.5 ${disabled ? "opacity-55" : ""}`}
    >
      <span
        className={`action-icon-btn group-active:scale-95 ${danger ? "hover:bg-red-500/20" : ""}`}
      >
        {children}
      </span>
      <span
        className={`max-w-[5.5rem] truncate text-center text-[11px] font-semibold leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_8px_rgba(0,0,0,0.6)] ${
          danger ? "text-red-200" : "text-white"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function VideoFeedSideActions({
  post,
  onCommentClick,
  onPostDeleted,
}: VideoFeedSideActionsProps) {
  const { user } = useAuth();
  const { canLike, canComment } = useAccess();
  const t = useT();
  const { locale } = useI18n();
  const { prefs } = useSettings();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const isOwner = Boolean(user && post.postUserId === user.uid);
  const caption = getPostCaption(post, locale);

  useEffect(() => {
    setLiked(user ? post.likedByIds.includes(user.uid) : false);
    setSaved(user ? post.savedByIds.includes(user.uid) : false);
    setLikeCount(post.likedByIds.length);
  }, [post, user]);

  function showFlash(message: string) {
    setFlash(message);
    setTimeout(() => setFlash(null), 1800);
  }

  function requireAuth() {
    triggerGuestModal();
  }

  async function handleLike() {
    if (!canLike) {
      requireAuth();
      return;
    }
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    try {
      await toggleLike(post.id, user.uid, !next);
      if (next && prefs.autoArchive && !saved) {
        await toggleSavePost(post.id, user.uid, false).catch(() => {});
        setSaved(true);
      }
    } catch {
      setLiked(!next);
      setLikeCount(post.likedByIds.length);
    }
  }

  async function handleSave() {
    if (!canLike) {
      requireAuth();
      return;
    }
    if (!user) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleSavePost(post.id, user.uid, !next);
      showFlash(next ? t("savedToCollection") : t("removedFromSaved"));
    } catch {
      setSaved(!next);
    }
  }

  function handleShareClick() {
    if (!prefs.allowSharing) return;
    setShareOpen(true);
  }

  async function handleRepost() {
    if (!canLike) {
      requireAuth();
      return;
    }
    if (!user || isOwner) return;
    setBusy(true);
    try {
      await repostUserPost(post.id, user.uid);
      showFlash(t("repostSuccess"));
    } catch {
      showFlash(t("repostFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user || !isOwner) return;
    setBusy(true);
    try {
      await deleteUserPost(post.id, user.uid);
      setDeleteOpen(false);
      onPostDeleted?.();
    } catch {
      showFlash(t("postDeleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 video-overlay-scrim" />
      <div className="reels-side-actions pointer-events-auto absolute right-3 z-10 flex flex-col items-center gap-4">
        <ActionButton
          onClick={handleLike}
          label={String(likeCount)}
          disabled={!canLike}
        >
          <motion.div animate={liked ? { scale: [1, 1.25, 1] } : {}}>
            <IconHeart
              size={22}
              filled={liked}
              className={liked ? "text-gold" : "text-foreground"}
            />
          </motion.div>
        </ActionButton>

        <ActionButton
          label={t("comment")}
          disabled={!canComment}
          onClick={() => {
            if (!canComment) {
              requireAuth();
              return;
            }
            onCommentClick?.();
          }}
        >
          <IconMessage size={22} className="text-foreground" />
        </ActionButton>

        <ActionButton label={t("share")} onClick={handleShareClick}>
          <IconShare size={22} className="text-vibe" />
        </ActionButton>

        <ShareToStoryButton
          postId={post.id}
          showLabel
          labelClassName="text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95),0_0_8px_rgba(0,0,0,0.6)]"
          onToast={showFlash}
        />

        <ActionButton label={t("save")} onClick={handleSave} disabled={!canLike}>
          <IconBookmark
            size={22}
            filled={saved}
            className={saved ? "text-gold" : "text-foreground"}
          />
        </ActionButton>

        {!isOwner && (
          <ActionButton
            label={t("repost")}
            onClick={handleRepost}
            disabled={!canLike || busy}
          >
            <IconRepost size={22} className="text-vibe" />
          </ActionButton>
        )}

        {isOwner && (
          <ActionButton
            label={t("deletePost")}
            onClick={() => setDeleteOpen(true)}
            danger
          >
            <IconTrash size={22} className="text-red-400" />
          </ActionButton>
        )}
      </div>

      <div className="reels-caption pointer-events-none absolute left-4 right-20 z-10 md:right-24">
        {post.postUserId ? (
          <Link
            href={`/user/${post.postUserId}`}
            className="pointer-events-auto font-semibold text-white drop-shadow-md hover:underline"
          >
            @{post.userName ?? "user"}
          </Link>
        ) : (
          <p className="font-semibold text-white drop-shadow-md">
            @{post.userName ?? "user"}
          </p>
        )}
        {caption && (
          <p className="mt-1 line-clamp-3 text-sm text-white/90 drop-shadow-md">
            {caption}
          </p>
        )}
        {post.taggedPeople && post.taggedPeople.length > 0 && (
          <PostTaggedPeople
            tags={post.taggedPeople}
            className="mt-1 line-clamp-2 text-sm drop-shadow-sm"
            lightText
          />
        )}
      </div>

      {flash && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
          {flash}
        </div>
      )}

      <AnimatePresence>
        {deleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => !busy && setDeleteOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl border border-white/10 bg-surface-card p-6 pb-10"
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
              <h2 className="font-display text-lg font-semibold text-red-400">
                {t("deletePostConfirm")}
              </h2>
              <p className="mt-2 text-sm text-muted">{t("deletePostDesc")}</p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
                >
                  {t("close")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                >
                  {t("deletePost")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={shareOpen ? buildPostSharePayload(post) : null}
        onToast={showFlash}
      />
    </div>
  );
}
