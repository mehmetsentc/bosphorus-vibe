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
import { getFastFlowPlaybackUrl } from "@/lib/utils/video-sources";
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

export function VideoPlayer(props: VideoPlayerProps) {
  if (props.playbackContext === "reels") {
    return <ReelsVideoPlayer {...props} />;
  }
  return <AdaptiveVideoPlayer {...props} />;
}

function ReelsVideoPlayer(props: VideoPlayerProps) {
  const { post, isActive = true, isNext = false, isNear = false } = props;
  const shouldLoad = isActive || isNext || isNear;
  const { src, poster, onError, srcIndex } = useReelsVideoSrc(post, shouldLoad);
  const videoSrc = src || getFastFlowPlaybackUrl(post);
  return (
    <VideoPlayerCore
      {...props}
      isReels
      videoSrc={videoSrc}
      poster={poster}
      playbackSrcIndex={srcIndex}
      onPlaybackError={onError}
    />
  );
}

function AdaptiveVideoPlayer(props: VideoPlayerProps) {
  const { post, playbackContext = "detail" } = props;
  const { src, poster, onError } = useAdaptiveVideoSrc(post, playbackContext);
  return (
    <VideoPlayerCore
      {...props}
      isReels={false}
      videoSrc={src}
      poster={poster}
      onPlaybackError={onError}
    />
  );
}

type VideoPlayerCoreProps = VideoPlayerProps & {
  isReels: boolean;
  videoSrc: string;
  poster?: string;
  playbackSrcIndex?: number;
  onPlaybackError: () => boolean;
};

function VideoPlayerCore({
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
  isReels,
  videoSrc,
  poster,
  playbackSrcIndex = 0,
  onPlaybackError,
}: VideoPlayerCoreProps) {
  const videoClassName =
    className ??
    (fit === "cover"
      ? "absolute inset-0 h-full w-full object-cover"
      : "max-h-full max-w-full object-contain");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);
  const prevVideoSrcRef = useRef("");
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  const isReelsContext = isReels;
  const shouldLoad = isActive || isNext || isNear;

  const handleAdaptiveError = onPlaybackError;

  const preload = isReelsContext
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

  const [isMuted, setIsMuted] = useState(() => (isReelsContext ? true : reelsMuted));
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(() => !poster);
  const [showPoster, setShowPoster] = useState(true);

  const revealReelsFrame = useCallback((video: HTMLVideoElement) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setShowPoster(false);
      setLoading(false);
    }
  }, []);

  const attemptPlay = useCallback(
    (video: HTMLVideoElement) => {
      const muted = isReelsContext ? true : reelsMuted;
      setIsMuted(muted);
      applyMuted(video, muted);
      const tryPlay = () => {
        void video.play().then(() => {
          requestPlay(post.id);
        }).catch(() => {
          applyMuted(video, true);
          setIsMuted(true);
          void video.play().catch(() => {});
        });
      };
      tryPlay();
      if (isReelsContext && isActive) {
        window.setTimeout(() => {
          if (video.paused && isActive) tryPlay();
        }, 120);
        window.setTimeout(() => {
          if (video.paused && isActive) tryPlay();
        }, 400);
      }
    },
    [isReelsContext, isActive, reelsMuted, requestPlay, post.id],
  );

  useEffect(() => {
    setShowPoster(true);
    hasPlayedRef.current = false;
    prevVideoSrcRef.current = "";
    setLoading(!poster);
  }, [post.id, videoSrc, poster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (prevVideoSrcRef.current && prevVideoSrcRef.current !== videoSrc) {
      video.load();
      if (isActive && autoPlay) attemptPlay(video);
    }
    prevVideoSrcRef.current = videoSrc;
  }, [videoSrc, isActive, autoPlay, attemptPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReelsContext) return;
    if (shouldLoad) return;
    video.pause();
    applyMuted(video, true);
    video.removeAttribute("src");
    video.load();
    releasePlay(post.id);
  }, [shouldLoad, isReelsContext, releasePlay, post.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playingId !== null && playingId !== post.id) {
      video.pause();
      applyMuted(video, true);
    }
  }, [playingId, post.id]);

  useEffect(() => {
    if (isReelsContext || !isActive) return;
    setIsMuted(reelsMuted);
    const video = videoRef.current;
    if (video) applyMuted(video, reelsMuted);
  }, [reelsMuted, isActive, isReelsContext]);

  // Active slide: load + play immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (isActive && autoPlay) {
      applyMuted(video, isReelsContext ? true : reelsMuted);
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) video.load();
      attemptPlay(video);
      return;
    }

    video.pause();
    applyMuted(video, true);
    if (!isActive && !isNext && !(isReelsContext && isNear)) {
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
    isReelsContext,
    reelsMuted,
    attemptPlay,
    releasePlay,
  ]);

  useEffect(() => () => clearLoadingTimer(), [clearLoadingTimer]);

  // Reels: if first URL never decodes, try next tier after a short wait (not during normal buffer)
  useEffect(() => {
    if (!isReelsContext || !isActive || !videoSrc) return;
    const timeoutMs = 5000;
    const timeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || hasPlayedRef.current) return;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      const downgraded = handleAdaptiveError();
      if (downgraded) {
        setShowPoster(true);
        setLoading(true);
      }
    }, timeoutMs);
    return () => window.clearTimeout(timeout);
  }, [isActive, videoSrc, playbackSrcIndex, isReelsContext, handleAdaptiveError]);

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

  if (!videoSrc && !poster) return null;

  const videoKey = isReelsContext
    ? `${post.id}-${playbackSrcIndex}-${videoSrc}`
    : `${post.id}-${videoSrc || "pending"}`;

  return (
    <div
      className={
        fit === "cover"
          ? "absolute inset-0 overflow-hidden bg-black"
          : "absolute inset-0 flex items-center justify-center overflow-hidden bg-black"
      }
    >
      {(showPoster || !videoSrc) && poster && (
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
          {...({ webkitPlaysinline: "true" } as Record<string, string>)}
          autoPlay={isActive && autoPlay}
          muted={isMuted}
          preload={preload}
          className={`${videoClassName} z-[1] [transform:translateZ(0)]`}
          onLoadStart={() => setLoading(true)}
          onLoadedData={(e) => {
            if (isReelsContext) revealReelsFrame(e.currentTarget);
            if (isActive && autoPlay && videoRef.current?.paused) {
              attemptPlay(videoRef.current);
            }
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            if (isReelsContext) revealReelsFrame(e.currentTarget);
          }}
          onCanPlay={(e) => {
            setLoading(false);
            if (isReelsContext) revealReelsFrame(e.currentTarget);
            if (isActive && autoPlay && videoRef.current?.paused) {
              attemptPlay(videoRef.current);
            }
            onReady?.();
          }}
          onError={handleVideoError}
          onStalled={() => {
            const video = videoRef.current;
            if (!video || !isReelsContext || !isActive) return;
            window.setTimeout(() => {
              if (video.paused && isActive) void video.play().catch(() => {});
            }, 300);
          }}
          onWaiting={() => {
            clearLoadingTimer();
            if (isReelsContext) return;
            loadingTimerRef.current = setTimeout(() => setLoading(true), 400);
          }}
          onPlaying={() => {
            clearLoadingTimer();
            hasPlayedRef.current = true;
            setLoading(false);
            setShowPoster(false);
            requestPlay(post.id);
          }}
          onPause={() => {
            if (!isReelsContext && !hasPlayedRef.current) setShowPoster(true);
          }}
          onTimeUpdate={(e) => {
            setCurrent(e.currentTarget.currentTime);
            setDuration(e.currentTarget.duration || 0);
            if (isActive && e.currentTarget.currentTime > 0.05) {
              hasPlayedRef.current = true;
              setShowPoster(false);
            }
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
