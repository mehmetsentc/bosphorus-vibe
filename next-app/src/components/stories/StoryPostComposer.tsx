"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import {
  createStoryFromPost,
  isStoryVideo,
  pickStoryVideoSource,
} from "@/lib/services/stories";
import {
  getPostById,
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
} from "@/lib/services/firestore";
import { getUserDoc } from "@/lib/services/auth";
import { StoryMediaDisplay } from "@/components/stories/StoryMediaDisplay";
import type { StoryDoc, UserPostDoc } from "@/types";

type StoryPostComposerProps = {
  open: boolean;
  postId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  onToast?: (message: string) => void;
};

export function StoryPostComposer({
  open,
  postId,
  onClose,
  onSuccess,
  onToast,
}: StoryPostComposerProps) {
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const t = useT();
  const tier = useEffectiveNetworkTier();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState<UserPostDoc | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [showText, setShowText] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setPost(null);
      setOwnerName("");
      setOverlayText("");
      setShowText(false);
      setError("");
      return;
    }
    if (!postId) return;

    setLoading(true);
    void (async () => {
      try {
        const p = await getPostById(postId);
        if (!p) {
          setError(t("storyShareFailed"));
          return;
        }
        setPost(p);
        if (p.postUserId) {
          const owner = await getUserDoc(p.postUserId);
          setOwnerName(
            owner?.userName || owner?.display_name || "user",
          );
        }
      } catch {
        setError(t("storyShareFailed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, postId, t]);

  const previewStory = useMemo((): StoryDoc | null => {
    if (!post) return null;
    const video = getPostVideoUrl(post);
    const image = getPostImageUrl(post);
    return {
      id: post.id,
      userId: post.postUserId ?? "",
      storyPhoto: post.postVideothumbnail || image || undefined,
      storyVideo: video || undefined,
      storyVideo_low: post.postVideoURL_low || post.postVideoURL || undefined,
      videoUrl: post.postVideoURL || video || undefined,
      videoUrl_low: post.postVideoURL_low || undefined,
      storyDescription: getPostCaption(post),
      storyPostedAt: post.timePosted,
      isExpired: false,
      viewedByIds: [],
      numComments: 0,
    };
  }, [post]);

  const isVideo = previewStory ? isStoryVideo(previewStory) : false;
  const mediaUrl = previewStory
    ? isVideo
      ? pickStoryVideoSource(previewStory, tier).src
      : previewStory.storyPhoto || getPostImageUrl(post!) || ""
    : "";
  const poster =
    previewStory && isVideo
      ? pickStoryVideoSource(previewStory, tier).poster
      : undefined;

  const userPhoto = profile?.photo_url || user?.photoURL || "";

  const handleShare = useCallback(async () => {
    if (!postId || !user || !canUpload || !post) return;
    setSharing(true);
    setError("");
    try {
      await createStoryFromPost(postId, user.uid, {
        overlayText: overlayText.trim(),
        sharedFromUserName: ownerName,
      });
      onToast?.(t("storyShareSuccess"));
      onSuccess?.();
      onClose();
    } catch {
      setError(t("storyShareFailed"));
    } finally {
      setSharing(false);
    }
  }, [
    postId,
    user,
    canUpload,
    post,
    overlayText,
    ownerName,
    onToast,
    onSuccess,
    onClose,
    t,
  ]);

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[145] bg-black"
      >
        <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-white"
            aria-label={t("close")}
          >
            ✕
          </button>
          <h1 className="text-sm font-semibold text-white">{t("shareStory")}</h1>
          <button
            type="button"
            onClick={() => setShowText((v) => !v)}
            className={`rounded-lg px-2 py-1 text-sm font-bold ${showText ? "bg-white text-black" : "text-white"}`}
          >
            Aa
          </button>
        </header>

        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-zinc-950" />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-14 pb-28">
          {loading && (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {!loading && previewStory && mediaUrl && (
            <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/20">
              <StoryMediaDisplay
                src={mediaUrl}
                isVideo={isVideo}
                poster={poster}
                mediaKey={`composer-${postId}-${tier}`}
                autoPlay={isVideo}
                preload={getPreloadStrategy(tier, true)}
                videoRef={videoRef}
                className="h-full w-full object-cover"
              />
              {ownerName && (
                <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  @{ownerName}
                </div>
              )}
              {overlayText && (
                <p className="absolute bottom-4 left-0 right-0 px-4 text-center text-lg font-bold text-white drop-shadow-lg">
                  {overlayText}
                </p>
              )}
            </div>
          )}
          {!loading && !previewStory && error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
        </div>

        {showText && (
          <div className="absolute bottom-24 left-0 right-0 z-30 px-4">
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder={t("storyTextPlaceholder")}
              maxLength={120}
              className="w-full rounded-full border border-white/25 bg-black/50 px-4 py-3 text-center text-sm text-white outline-none placeholder:text-white/40 backdrop-blur-md"
            />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
          {error && !loading && (
            <p className="mb-2 text-center text-xs text-red-300">{error}</p>
          )}
          <button
            type="button"
            disabled={sharing || loading || !post}
            onClick={() => void handleShare()}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/15 disabled:opacity-50"
          >
            <div className="rounded-full bg-gradient-to-br from-gold via-vibe to-gold p-[2px]">
              <div className="h-11 w-11 overflow-hidden rounded-full bg-black">
                {userPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userPhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg text-white">
                    +
                  </span>
                )}
              </div>
            </div>
            <span className="flex-1 text-left font-semibold text-white">
              {sharing ? t("uploading") : t("storyShareToYourStory")}
            </span>
            {sharing && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
