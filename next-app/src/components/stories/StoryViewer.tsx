"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { IconHeart, IconShare } from "@/components/icons/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import { ShareSheet, type SharePayload } from "@/components/share/ShareSheet";
import { BRAND_NAME } from "@/lib/brand";
import {
  deleteStory,
  getStoryMediaUrl,
  isStoryExpired,
  isStoryVideo,
  markStoryViewed,
  pickStoryVideoSource,
  subscribeStory,
} from "@/lib/services/stories";
import { StoryMediaDisplay } from "@/components/stories/StoryMediaDisplay";
import {
  StoryViewersSheet,
  StoryViewersTrigger,
} from "@/components/stories/StoryViewersSheet";
import { PostTaggedPeople } from "@/components/post/PostTaggedPeople";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import type { StoryUserGroup } from "@/types";

const IMAGE_MS = 5000;

type StoryViewerProps = {
  groups: StoryUserGroup[];
  startGroupIndex: number;
  onClose: () => void;
  onChanged: () => void;
};

export function StoryViewer({
  groups,
  startGroupIndex,
  onClose,
  onChanged,
}: StoryViewerProps) {
  const { user } = useAuth();
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [liveViewedByIds, setLiveViewedByIds] = useState<string[]>([]);

  useEffect(() => {
    setGroupIndex(startGroupIndex);
    setStoryIndex(0);
    setProgress(0);
    setReply("");
    setLiked(false);
    setViewersOpen(false);
  }, [startGroupIndex]);

  const tier = useEffectiveNetworkTier();
  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const isVideo = story ? isStoryVideo(story) : false;
  const mediaUrl = story
    ? isVideo
      ? pickStoryVideoSource(story, tier).src
      : getStoryMediaUrl(story)
    : "";
  const storyPoster = story && isVideo ? pickStoryVideoSource(story, tier).poster : undefined;
  const videoPreload = getPreloadStrategy(tier, true);
  const isOwner = Boolean(user && group?.userId === user.uid);
  const caption = story?.storyDescription?.replace(/^\[close-friends\]\s*/, "") ?? "";

  const clearTimers = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const goNext = useCallback(() => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
      setLiked(false);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
      setLiked(false);
      return;
    }
    onClose();
  }, [group, storyIndex, groupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(Math.max(0, prevGroup.stories.length - 1));
      setProgress(0);
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    if (!story || !user) return;
    if (isStoryExpired(story)) {
      goNext();
      return;
    }
    if (!story.viewedByIds.includes(user.uid)) {
      markStoryViewed(story.id, user.uid).catch(() => {});
    }
  }, [story, user, goNext]);

  useEffect(() => {
    setLiveViewedByIds(story?.viewedByIds ?? []);
    setViewersOpen(false);
  }, [story?.id, story?.viewedByIds]);

  useEffect(() => {
    if (!story?.id || !isOwner) return;
    const unsub = subscribeStory(story.id, (updated) => {
      if (updated) setLiveViewedByIds(updated.viewedByIds);
    });
    return unsub;
  }, [story?.id, isOwner]);

  useEffect(() => {
    clearTimers();
    if (!story || paused || isVideo) return;

    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / IMAGE_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return clearTimers;
  }, [story, paused, isVideo, goNext, clearTimers]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || !story) return;
    video.currentTime = 0;
    setProgress(0);
    if (!paused) video.play().catch(() => {});
    else video.pause();
  }, [story, isVideo, paused]);

  function handleVideoTimeUpdate() {
    const video = videoRef.current;
    if (!video?.duration) return;
    setProgress(video.currentTime / video.duration);
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) goPrev();
    else if (x > rect.width * 0.7) goNext();
    else setPaused((p) => !p);
  }

  async function handleDelete() {
    if (!story || !user || !isOwner || deleting) return;
    if (!window.confirm(t("deleteStoryConfirm"))) return;
    setDeleting(true);
    try {
      await deleteStory(story.id, user.uid);
      onChanged();
      if (group.stories.length <= 1) {
        if (groups.length <= 1) onClose();
        else goNext();
      } else {
        setStoryIndex((i) => Math.max(0, i - 1));
      }
    } finally {
      setDeleting(false);
    }
  }

  const sharePayload = useMemo((): SharePayload | null => {
    if (!story) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      url: `${origin}/home`,
      title: `${group?.userName ?? BRAND_NAME} — ${BRAND_NAME}`,
      text: caption || BRAND_NAME,
      thumbnail: storyPoster || mediaUrl || undefined,
    };
  }, [story, group?.userName, caption, storyPoster, mediaUrl]);

  const progressBars = useMemo(() => {
    if (!group) return null;
    return group.stories.map((s, i) => {
      let fill = 0;
      if (i < storyIndex) fill = 1;
      else if (i === storyIndex) fill = progress;
      return (
        <div
          key={s.id}
          className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/35"
        >
          <div
            className="h-full bg-white transition-[width] duration-75 ease-linear"
            style={{ width: `${fill * 100}%` }}
          />
        </div>
      );
    });
  }, [group, storyIndex, progress]);

  if (!group || !story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center bg-black"
      >
        <div className="relative h-full w-full max-w-[430px] overflow-hidden bg-black">
          <div className="absolute left-0 right-0 top-0 z-20 flex gap-[3px] px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
            {progressBars}
          </div>

          <div className="absolute left-0 right-0 top-[max(2rem,env(safe-area-inset-top))] z-20 flex items-center justify-between px-3">
            <Link href={`/user/${group.userId}`} className="flex min-w-0 items-center gap-2">
              {group.userPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={group.userPhoto}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                  {group.userName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 text-left leading-tight">
                <p className="truncate text-sm font-semibold text-white">
                  {group.userName}
                </p>
                <p className="text-[11px] text-white/70">
                  {formatStoryTime(story.storyPostedAt)}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              {isOwner && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg px-2 py-1 text-xs text-white/80"
                >
                  ···
                </button>
              )}
              <button
                type="button"
                aria-label={t("close")}
                onClick={onClose}
                className="p-2 text-xl text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="absolute inset-0 z-10"
            onClick={handleTap}
            role="presentation"
          >
            <StoryMediaDisplay
              src={mediaUrl}
              isVideo={isVideo}
              poster={storyPoster}
              mediaKey={`${story.id}-${tier}`}
              autoPlay={isVideo && !paused}
              preload={videoPreload}
              videoRef={videoRef}
              onTimeUpdate={isVideo ? handleVideoTimeUpdate : undefined}
              onEnded={isVideo ? goNext : undefined}
            />
          </div>

          {caption && (
            <div className="pointer-events-none absolute bottom-24 left-0 right-0 z-20 px-6 text-center">
              <p className="text-base font-medium text-white drop-shadow-md">{caption}</p>
            </div>
          )}

          {story.taggedPeople && story.taggedPeople.length > 0 && (
            <div className="pointer-events-auto absolute bottom-16 left-0 right-0 z-20 px-6 text-center">
              <PostTaggedPeople
                tags={story.taggedPeople}
                className="text-sm text-white drop-shadow-md"
                lightText
              />
            </div>
          )}

          {paused && (
            <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center">
              <span className="text-4xl text-white/90">❚❚</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-2 border-t border-white/10 bg-black/40 px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
            {isOwner ? (
              <StoryViewersTrigger
                viewerIds={liveViewedByIds}
                excludeUid={user?.uid}
                onClick={() => {
                  setPaused(true);
                  setViewersOpen(true);
                }}
              />
            ) : (
              <>
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={t("storySendMessage")}
                  className="min-w-0 flex-1 rounded-full border border-white/25 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/50"
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiked((v) => !v);
                  }}
                  className="shrink-0 p-2"
                  aria-label={t("likes")}
                >
                  <IconHeart size={24} filled={liked} className={liked ? "text-red-500" : "text-white"} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareOpen(true);
                  }}
                  className="shrink-0 p-2 text-white"
                  aria-label={t("share")}
                >
                  <IconShare size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={shareOpen ? sharePayload : null}
      />

      <StoryViewersSheet
        open={viewersOpen}
        onClose={() => {
          setViewersOpen(false);
          setPaused(false);
        }}
        viewerIds={liveViewedByIds}
        excludeUid={user?.uid}
      />
    </AnimatePresence>
  );
}

function formatStoryTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m`;
  if (h < 24) return `${h}h`;
  return date.toLocaleDateString();
}
