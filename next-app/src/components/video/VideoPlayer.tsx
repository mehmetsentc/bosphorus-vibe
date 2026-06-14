"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAdaptiveVideoSrc } from "@/lib/hooks/useAdaptiveVideoSrc";
import {
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

const SEEK_STEP = 10;

type VideoFit = "cover" | "contain";

type VideoPlayerProps = {
  post: UserPostDoc;
  isActive?: boolean;
  isNext?: boolean;
  /** Within preload window but not active/next — metadata-only buffer */
  isNear?: boolean;
  autoPlay?: boolean;
  /** Reels/TikTok-style full bleed vs letterboxed detail view */
  fit?: VideoFit;
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

function applyMuted(video: HTMLVideoElement, muted: boolean) {
  video.muted = muted;
  if (muted) video.setAttribute("muted", "");
  else video.removeAttribute("muted");
}

export function VideoPlayer({
  post,
  isActive = true,
  isNext = false,
  isNear = false,
  autoPlay = true,
  fit = "contain",
  className,
  overlay,
  showSeekBar = true,
  onReady,
}: VideoPlayerProps) {
  const videoClassName =
    className ??
    (fit === "cover"
      ? "absolute inset-0 h-full w-full object-cover"
      : "max-h-full max-w-full object-contain");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);

  const {
    src: videoSrc,
    poster,
    tier: networkTier,
    onWaiting: handleAdaptiveWaiting,
    onPlaying: handleAdaptivePlaying,
    onError: handleAdaptiveError,
  } = useAdaptiveVideoSrc(post, "feed", isActive || isNext);
  const preload = isActive || isNext ? "auto" : isNear ? "metadata" : "none";
  const shouldPrime = isActive || isNext || isNear;

  const reelsMuted = useVideoSoundStore((s) => s.reelsMuted);
  const setReelsMuted = useVideoSoundStore((s) => s.setReelsMuted);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);

  const [isMuted, setIsMuted] = useState(reelsMuted);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(() => !poster);
  const [showPoster, setShowPoster] = useState(true);

  useEffect(() => {
    setShowPoster(true);
    hasPlayedRef.current = false;
  }, [videoSrc, post.id, networkTier]);

  // Another video started → pause this one
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playingId !== null && playingId !== post.id) video.pause();
  }, [playingId, post.id]);

  // Keep in sync when user toggles sound on another reel
  useEffect(() => {
    setIsMuted(reelsMuted);
    const video = videoRef.current;
    if (video && isActive) applyMuted(video, reelsMuted);
  }, [reelsMuted, isActive]);

  // Play/pause when active state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && autoPlay) {
      setIsMuted(reelsMuted);
      applyMuted(video, reelsMuted);
      if (video.readyState === 0) video.load();
      video.play().catch(() => {
        if (!reelsMuted) {
          setIsMuted(true);
          applyMuted(video, true);
        }
        video.play().catch(() => {
          const onCanPlay = () => video.play().catch(() => {});
          video.addEventListener("canplay", onCanPlay, { once: true });
          video.addEventListener("loadeddata", onCanPlay, { once: true });
          video.addEventListener("canplaythrough", onCanPlay, { once: true });
        });
      });
      requestPlay(post.id);
    } else {
      video.pause();
      if (!isActive) {
        video.currentTime = 0;
        setShowPoster(true);
        hasPlayedRef.current = false;
      }
      releasePlay(post.id);
    }
    return () => { releasePlay(post.id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, autoPlay, videoSrc, post.id, reelsMuted, requestPlay, releasePlay]);

  // Buffer adjacent slides before they become active
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldPrime || isActive) return;
    if (video.readyState === 0) video.load();
  }, [shouldPrime, isActive, videoSrc, post.id]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    const next = !isMuted;
    setIsMuted(next);
    setReelsMuted(next);
    if (video) applyMuted(video, next);
  }, [isMuted, setReelsMuted]);

  const handleVideoTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setIsMuted(false);
      setReelsMuted(false);
      applyMuted(video, false);
      video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [setReelsMuted]);

  const handleVideoError = useCallback(() => {
    const downgraded = handleAdaptiveError();
    if (downgraded) {
      setShowPoster(true);
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [handleAdaptiveError]);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || Infinity);
  }, []);

  if (!videoSrc) return null;

  return (
    <div
      className={
        fit === "cover"
          ? "absolute inset-0 overflow-hidden bg-black"
          : "absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
      }
    >
      {showPoster && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      <video
        ref={videoRef}
        key={`${post.id}-${videoSrc}`}
        src={videoSrc}
        poster={poster}
        loop
        playsInline
        autoPlay={isActive && autoPlay}
        muted={isMuted}
        preload={preload}
        className={videoClassName}
        onLoadStart={() => setLoading(true)}
        onLoadedData={() => {
          if (isActive) {
            setShowPoster(false);
            if (autoPlay && videoRef.current?.paused) {
              videoRef.current.play().catch(() => {});
            }
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          if (isActive && autoPlay && videoRef.current?.paused) {
            videoRef.current.play().catch(() => {});
          }
        }}
        onCanPlay={() => {
          setLoading(false);
          if (isActive) setShowPoster(false);
          if (isActive && autoPlay && videoRef.current?.paused) {
            videoRef.current.play().catch(() => {});
          }
          onReady?.();
        }}
        onCanPlayThrough={() => {
          if (isActive && autoPlay && videoRef.current?.paused) {
            videoRef.current.play().catch(() => {});
          }
        }}
        onError={handleVideoError}
        onWaiting={() => {
          setLoading(true);
          handleAdaptiveWaiting();
        }}
        onPlaying={() => {
          handleAdaptivePlaying();
          hasPlayedRef.current = true;
          setLoading(false);
          setShowPoster(false);
          requestPlay(post.id);
        }}
        onPause={() => {
          if (!hasPlayedRef.current) setShowPoster(true);
        }}
        onTimeUpdate={(e) => {
          setCurrent(e.currentTarget.currentTime);
          setDuration(e.currentTarget.duration || 0);
        }}
      />

      <button
        type="button"
        aria-label="Duraklat / Oynat"
        className="absolute inset-0 z-[5] cursor-default bg-transparent"
        onClick={handleVideoTap}
      />

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-3 top-4 z-[10] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
        aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
      >
        {isMuted
          ? <IconVolumeOff size={20} className="text-white" />
          : <IconVolumeOn  size={20} className="text-white" />
        }
      </button>

      {loading && isActive && !poster && (
        <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
        </div>
      )}

      {overlay}

      {showSeekBar && (
        <div className="reels-video-controls absolute bottom-0 left-0 right-0 z-[8] bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 md:pt-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); seekBy(-SEEK_STEP); }}
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
              onClick={(e) => { e.stopPropagation(); seekBy(SEEK_STEP); }}
              className="hidden rounded-lg border border-border px-2 py-1 text-xs text-foreground backdrop-blur-sm md:inline-block"
              style={{ background: "var(--action-bg)" }}
            >
              +{SEEK_STEP}s
            </button>
          </div>
          <div className="mt-1 hidden items-center justify-between text-[10px] text-white/70 md:flex">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
