"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toggleLike, toggleSavePost } from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useRouter } from "next/navigation";
import {
  IconBookmark,
  IconHeart,
  IconMessage,
  IconShare,
} from "@/components/icons/Icons";
import { useHideLikeCounts } from "@/lib/hooks/useSettingsEffects";
import { useSettings } from "@/components/settings/SettingsProvider";
import { ShareSheet } from "@/components/share/ShareSheet";
import { buildPostSharePayload } from "@/lib/utils/share-post";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type PostActionsBarProps = {
  post: UserPostDoc;
  onCommentClick: () => void;
  onLikeCountChange?: (count: number) => void;
  compact?: boolean;
  hideCommentPreview?: boolean;
};

export function PostActionsBar({
  post,
  onCommentClick,
  onLikeCountChange,
  compact = false,
  hideCommentPreview = false,
}: PostActionsBarProps) {
  const { user } = useAuth();
  const { canLike } = useAccess();
  const router = useRouter();
  const t = useT();
  const hideLikeCounts = useHideLikeCounts();
  const { prefs } = useSettings();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [commentCount, setCommentCount] = useState(post.numComments);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    setLiked(user ? post.likedByIds.includes(user.uid) : false);
    setSaved(user ? post.savedByIds.includes(user.uid) : false);
    setLikeCount(post.likedByIds.length);
    setCommentCount(post.numComments);
  }, [post, user]);

  async function handleLike() {
    if (!canLike) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (!user) return;
    const next = !liked;
    setLiked(next);
    const newCount = next ? likeCount + 1 : likeCount - 1;
    setLikeCount(newCount);
    onLikeCountChange?.(newCount);
    try {
      await toggleLike(post.id, user.uid, !next);
      if (next && prefs.autoArchive && !saved) {
        await toggleSavePost(post.id, user.uid, false).catch(() => {});
        setSaved(true);
      }
    } catch {
      setLiked(!next);
      setLikeCount(post.likedByIds.length);
      onLikeCountChange?.(post.likedByIds.length);
    }
  }

  async function handleSave() {
    if (!canLike) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (!user) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleSavePost(post.id, user.uid, !next);
    } catch {
      setSaved(!next);
    }
  }

  function handleShareClick() {
    if (!prefs.allowSharing) return;
    setShareOpen(true);
  }

  function showShareToast(message: string) {
    setShareToast(message);
    setTimeout(() => setShareToast(null), 2000);
  }

  const iconSize = compact ? 22 : 24;
  const btnClass =
    "rounded-lg p-2 transition active:scale-90 hover:bg-surface-overlay";

  return (
    <div className={compact ? "px-3 pt-2" : "px-4 pt-3"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("likes")}
            onClick={handleLike}
            className={btnClass}
          >
            <motion.div animate={liked ? { scale: [1, 1.2, 1] } : {}}>
              <IconHeart
                size={iconSize}
                filled={liked}
                className={liked ? "text-gold" : "text-foreground"}
              />
            </motion.div>
          </button>
          <button
            type="button"
            aria-label={t("comment")}
            onClick={onCommentClick}
            className={btnClass}
          >
            <IconMessage size={iconSize} className="text-foreground" />
          </button>
          <button
            type="button"
            aria-label={t("share")}
            onClick={handleShareClick}
            disabled={!prefs.allowSharing}
            className={`${btnClass} disabled:opacity-40`}
          >
            <IconShare size={iconSize} className="text-foreground" />
          </button>
        </div>
        <button
          type="button"
          aria-label={t("save")}
          onClick={handleSave}
          className={btnClass}
        >
          <IconBookmark
            size={iconSize}
            filled={saved}
            className={saved ? "text-gold" : "text-foreground"}
          />
        </button>
      </div>

      {likeCount > 0 && !hideLikeCounts && !hideCommentPreview && (
        <p className={`mt-2 text-sm font-semibold ${compact ? "px-1" : ""}`}>
          {likeCount} {t("likes")}
        </p>
      )}
      {commentCount > 0 && !hideCommentPreview && (
        <button
          type="button"
          onClick={onCommentClick}
          className={`mt-1 text-left text-sm text-muted hover:text-foreground ${compact ? "px-1" : ""}`}
        >
          {t("viewAllComments", { count: String(commentCount) })}
        </button>
      )}

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={shareOpen ? buildPostSharePayload(post) : null}
        onToast={showShareToast}
      />

      {shareToast && (
        <p className="mt-2 text-xs text-vibe">{shareToast}</p>
      )}
    </div>
  );
}
