"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAdaptiveVideoSrc } from "@/lib/hooks/useAdaptiveVideoSrc";
import { useReelsVideoSrc } from "@/lib/hooks/useReelsVideoSrc";
import type { VideoPlaybackContext } from "@/lib/utils/video-sources";
import {
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import { REELS_FIRST_FRAME_TIMEOUT_MS } from "@/lib/performance/app-state";
import type { UserPostDoc } from "@/types";

const SEEK_STEP = 10;

type VideoFit = "cover" | "contain";

type VideoPlayerProps = {
  post: UserPostDoc;
  isActive?: boolean;
  isNext?: boolean;
  isNear?: boolean;
  autoPlay?: boolean;
  fit?: VideoFit;
  playbackContext?: VideoPlaybackContext;
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
  playbackContext = "detail",
}: VideoPlayerProps) {
  const videoClassName =
    className ??
    (fit === "cover"
      ? "absolute inset-0 h-full w-full object-cover"
      : "max-h-full max-w-full object-contain");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  const isReels = playbackContext === "reels";
  const shouldLoad = isActive || isNext || isNear;

  const reelsVideo = useReelsVideoSrc(post, isReels && shouldLoad, isActive, isNext);
  const adaptiveVideo = useAdaptiveVideoSrc(
    post,
    playbackContext,
    !isReels && shouldLoad,
  );

  const {
    src: videoSrc,
    poster,
    onWaiting: handleAdaptiveWaiting,
    onPlaying: handleAdaptivePlaying,
    onError: handleAdaptiveError,
  } = isReels ? reelsVideo : adaptiveVideo;

  const resolving = isReels && reelsVideo.resolving;
  const preload = isReels
    ? isActive || isNext
      ? "auto"
      : "none"
    : isActive
      ? "auto"
      : isNext
        ? "metadata"
        : "none";

  const reelsMuted = useVideoSoundStore((s) => s.reelsMuted);
  const setReelsMuted = useVideoSoundStore((s) => s.setReelsMuted);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);

  const [isMuted, setIsMuted] = useState(() => (isReels ? true : reelsMuted));
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(() => !poster);
  const [showPoster, setShowPoster] = useState(true);

  const attemptPlay = useCallback(
    (video: HTMLVideoElement) => {
      const muted = isReels ? true : reelsMuted;
      setIsMuted(muted);
      applyMuted(video, muted);
      void video.play().catch(() => {
        applyMuted(video, true);
        setIsMuted(true);
        void video.play().catch(() => {});
      });
      requestPlay(post.id);
    },
    [isReels, reelsMuted, requestPlay, post.id],
  );

  useEffect(() => {
    setShowPoster(true);
    hasPlayedRef.current = false;
    setLoading(!poster);
  }, [post.id, videoSrc, poster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReels) return;
    if (shouldLoad) return;
    video.pause();
    applyMuted(video, true);
    video.removeAttribute("src");
    video.load();
    releasePlay(post.id);
  }, [shouldLoad, isReels, releasePlay, post.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playingId !== null && playingId !== post.id) {
      video.pause();
      applyMuted(video, true);
    }
  }, [playingId, post.id]);

  useEffect(() => {
    if (isReels || !isActive) return;
    setIsMuted(reelsMuted);
    const video = videoRef.current;
    if (video) applyMuted(video, reelsMuted);
  }, [reelsMuted, isActive, isReels]);

  // Active slide: load + play immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (isActive && autoPlay) {
      applyMuted(video, isReels ? true : reelsMuted);
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) video.load();
      attemptPlay(video);
      return;
    }

    video.pause();
    applyMuted(video, true);
    if (!isActive && !isNext && !(isReels && isNear)) {
      video.currentTime = 0;
      setShowPoster(true);
      hasPlayedRef.current = false;
    }
    releasePlay(post.id);
  }, [
    isActive,
    isNext,
    isNear,
    autoPlay,
    videoSrc,
    post.id,
    isReels,
    reelsMuted,
    attemptPlay,
    releasePlay,
  ]);

  useEffect(() => () => clearLoadingTimer(), [clearLoadingTimer]);

  // Force fallback when active video never reaches first frame
  useEffect(() => {
    if (!isActive || !videoSrc) return;
    const timeoutMs = isReels ? REELS_FIRST_FRAME_TIMEOUT_MS : 3500;
    const timeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || hasPlayedRef.current) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        const downgraded = handleAdaptiveError();
        if (downgraded) {
          setShowPoster(true);
          setLoading(true);
        }
      }
    }, timeoutMs);
    return () => window.clearTimeout(timeout);
  }, [isActive, videoSrc, handleAdaptiveError, isReels]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || isActive || !videoSrc) return;
    if (video.readyState === 0) video.load();
  }, [shouldLoad, isActive, videoSrc]);

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      const next = !isMuted;
      setIsMuted(next);
      setReelsMuted(next);
      if (video) applyMuted(video, next);
    },
    [isMuted, setReelsMuted],
  );

  const handleVideoTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setIsMuted(false);
      setReelsMuted(false);
      applyMuted(video, false);
      void video.play().catch(() => {});
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
    video.currentTime = Math.min(
      Math.max(0, video.currentTime + delta),
      video.duration || Infinity,
    );
  }, []);

  if (!videoSrc && !resolving && !poster) return null;

  const videoKey = `${post.id}-${videoSrc || "pending"}`;

  return (
    <div
      className={
        fit === "cover"
          ? "absolute inset-0 overflow-hidden bg-black"
          : "absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
      }
    >
      {(showPoster || resolving || !videoSrc) && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 z-[2] h-full w-full object-cover"
        />
      )}

      {videoSrc && (
        <video
          ref={videoRef}
          key={videoKey}
          data-reel-id={post.id}
          src={videoSrc}
          poster={poster}
          loop
          playsInline
          autoPlay={isActive && autoPlay}
          muted={isMuted}
          preload={preload}
          className={`${videoClassName} z-[1]`}
          onLoadStart={() => setLoading(true)}
          onLoadedData={() => {
            if (isActive && autoPlay && videoRef.current?.paused) {
              attemptPlay(videoRef.current);
            }
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
          }}
          onCanPlay={() => {
            setLoading(false);
            if (isActive && autoPlay && videoRef.current?.paused) {
              attemptPlay(videoRef.current);
            }
            onReady?.();
          }}
          onError={handleVideoError}
          onWaiting={() => {
            clearLoadingTimer();
            loadingTimerRef.current = setTimeout(() => setLoading(true), 400);
            handleAdaptiveWaiting();
          }}
          onPlaying={() => {
            clearLoadingTimer();
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
      )}

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
        {isMuted ? (
          <IconVolumeOff size={20} className="text-white" />
        ) : (
          <IconVolumeOn size={20} className="text-white" />
        )}
      </button>

      {loading && isActive && videoSrc && !showPoster && (
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
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
