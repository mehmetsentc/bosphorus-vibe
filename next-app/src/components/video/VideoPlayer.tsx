"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import {
  getPreloadStrategy,
} from "@/lib/hooks/useNetworkQuality";
import { pickVideoSource } from "@/lib/utils/video-sources";
import {
  IconPause,
  IconPlay,
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

const DOUBLE_TAP_MS = 280;
const SEEK_STEP = 10;

type VideoPlayerProps = {
  post: UserPostDoc;
  isActive?: boolean;
  /** True for the video immediately after the active one — preloads in background */
  isNext?: boolean;
  autoPlay?: boolean;
  className?: string;
  overlay?: ReactNode;
  showSeekBar?: boolean;
  onReady?: () => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  post,
  isActive = true,
  isNext = false,
  autoPlay = true,
  className = "max-h-full max-w-full object-contain",
  overlay,
  showSeekBar = true,
  onReady,
}: VideoPlayerProps) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const networkTier = useEffectiveNetworkTier();
  const { src, poster } = pickVideoSource(post, networkTier);
  // Active: auto or metadata based on speed. Next-in-queue: metadata to buffer ahead. Others: none.
  const preload = isActive
    ? getPreloadStrategy(networkTier, true)
    : isNext
      ? "metadata"
      : "none";

  const muted = useVideoSoundStore((s) => s.feedMuted);
  const setFeedMuted = useVideoSoundStore((s) => s.setFeedMuted);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [muteFlash, setMuteFlash] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPoster, setShowPoster] = useState(true);

  // Global singleton: another video started → pause this one
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playingId !== null && playingId !== post.id) {
      video.pause();
    }
  }, [playingId, post.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && autoPlay) {
      video.play().catch(() => setPlaying(false));
      requestPlay(post.id);
    } else {
      video.pause();
      if (!isActive) {
        video.currentTime = 0;
        setShowPoster(true);
      }
      releasePlay(post.id);
    }
    return () => { releasePlay(post.id); };
  }, [isActive, autoPlay, src, post.id, requestPlay, releasePlay]);

  useEffect(() => {
    if (networkTier === "fast" && isActive) {
      videoRef.current?.play().catch(() => {});
    }
  }, [networkTier, isActive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
      setShowPauseIcon(false);
    } else {
      video.pause();
      setPlaying(false);
      setShowPauseIcon(true);
      setTimeout(() => setShowPauseIcon(false), 600);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setFeedMuted(next);
    setMuteFlash(!next);
    setTimeout(() => setMuteFlash(null), 700);
  }, [muted, setFeedMuted]);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(
      Math.max(0, video.currentTime + delta),
      video.duration || Infinity,
    );
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      lastTapRef.current = 0;
      toggleMute();
      return;
    }
    lastTapRef.current = now;
    tapTimerRef.current = setTimeout(() => {
      togglePlay();
    }, DOUBLE_TAP_MS);
  }, [toggleMute, togglePlay]);

  if (!src) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* Thumbnail shown until video starts playing */}
      {showPoster && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        key={`${post.id}-${networkTier}`}
        src={src}
        poster={poster}
        loop
        muted={muted}
        playsInline
        preload={preload}
        className={className}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => {
          setLoading(false);
          onReady?.();
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
          setShowPoster(false);
          requestPlay(post.id);
        }}
        onPause={() => {
          setPlaying(false);
          setShowPoster(true);
        }}
        onTimeUpdate={(e) => {
          setCurrent(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration || 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      {/* Dokunma alanı */}
      <button
        type="button"
        aria-label={t("videoControl")}
        className="absolute inset-0 z-[5] cursor-default bg-transparent"
        onClick={handleTap}
      />

      {loading && isActive && (
        <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
          {networkTier === "slow" && (
            <span className="absolute bottom-24 text-xs text-white/60">
              {t("slowConnection")}
            </span>
          )}
        </div>
      )}

      {showPauseIcon && (
        <div className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center">
          <div className="action-icon-btn h-16 w-16">
            <IconPause size={28} className="text-foreground" />
          </div>
        </div>
      )}

      {muteFlash !== null && (
        <div className="pointer-events-none absolute inset-0 z-[7] flex items-center justify-center">
          <div className="action-icon-btn h-16 w-16">
            {muteFlash ? (
              <IconVolumeOn size={28} className="text-vibe" />
            ) : (
              <IconVolumeOff size={28} className="text-muted" />
            )}
          </div>
        </div>
      )}

      {overlay}

      {showSeekBar && (
        <div className="reels-video-controls absolute bottom-0 left-0 right-0 z-[8] bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 md:pt-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                seekBy(-SEEK_STEP);
              }}
              className="hidden rounded-lg border border-border px-2 py-1 text-xs text-foreground backdrop-blur-sm md:inline-block"
              style={{ background: "var(--action-bg)" }}
            >
              -{SEEK_STEP}s
            </button>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={current}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = Number(e.target.value);
              }}
              className="h-1 flex-1 accent-vibe"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                seekBy(SEEK_STEP);
              }}
              className="hidden rounded-lg border border-border px-2 py-1 text-xs text-foreground backdrop-blur-sm md:inline-block"
              style={{ background: "var(--action-bg)" }}
            >
              +{SEEK_STEP}s
            </button>
          </div>
          <div className="mt-1 hidden items-center justify-between text-[10px] text-white/70 md:flex">
            <span>{formatTime(current)}</span>
            <span className="flex items-center gap-1.5">
              {playing ? (
                <IconPlay size={12} className="text-vibe" />
              ) : (
                <IconPause size={12} className="text-gold" />
              )}
              {muted ? (
                <IconVolumeOff size={12} className="text-muted" />
              ) : (
                <IconVolumeOn size={12} className="text-vibe" />
              )}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
          <p className="mt-1 hidden text-center text-[9px] text-white/30 md:block">
            {t("tapHint")}
          </p>
        </div>
      )}
    </div>
  );
}
