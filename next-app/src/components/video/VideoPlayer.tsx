"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEffectiveNetworkTier } from "@/lib/hooks/useSettingsEffects";
import { getPreloadStrategy } from "@/lib/hooks/useNetworkQuality";
import { pickVideoSource } from "@/lib/utils/video-sources";
import {
  IconVolumeOff,
  IconVolumeOn,
} from "@/components/icons/Icons";
import { useVideoSoundStore } from "@/store/videoSoundStore";
import { useVideoPlayStore } from "@/store/videoPlayStore";
import type { UserPostDoc } from "@/types";

const SEEK_STEP = 10;

type VideoPlayerProps = {
  post: UserPostDoc;
  isActive?: boolean;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);

  const networkTier = useEffectiveNetworkTier();
  const { src, poster } = pickVideoSource(post, networkTier, "feed");
  const preload = isActive ? getPreloadStrategy(networkTier, true) : isNext ? "metadata" : "none";

  const muted = useVideoSoundStore((s) => s.feedMuted);
  const setFeedMuted = useVideoSoundStore((s) => s.setFeedMuted);
  const requestPlay = useVideoPlayStore((s) => s.requestPlay);
  const releasePlay = useVideoPlayStore((s) => s.releasePlay);
  const playingId = useVideoPlayStore((s) => s.playingId);

  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPoster, setShowPoster] = useState(true);

  // Another video started → pause this one
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playingId !== null && playingId !== post.id) video.pause();
  }, [playingId, post.id]);

  // Play/pause when active state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && autoPlay) {
      video.muted = true; // always start muted — iOS autoplay requirement
      video.play().catch(() => {});
      requestPlay(post.id);
    } else {
      video.pause();
      if (!isActive) {
        video.currentTime = 0;
        video.muted = true;
        setShowPoster(true);
        hasPlayedRef.current = false;
      }
      releasePlay(post.id);
    }
    return () => { releasePlay(post.id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, autoPlay, src, post.id, requestPlay, releasePlay]);

  // Sound toggle — just set .muted directly (no play/pause needed)
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setFeedMuted(next);
    const video = videoRef.current;
    if (video) video.muted = next;
  }, [muted, setFeedMuted]);

  // Tap on video = pause / resume
  const handleVideoTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = muted;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [muted]);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || Infinity);
  }, []);

  if (!src) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      {/* Poster until video starts */}
      {showPoster && poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      <video
        ref={videoRef}
        key={`${post.id}-${networkTier}`}
        src={src}
        poster={poster}
        loop
        playsInline
        preload={preload}
        className={className}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => { setLoading(false); onReady?.(); }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
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
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      {/* Tap area for pause/play */}
      <button
        type="button"
        aria-label="Duraklat / Oynat"
        className="absolute inset-0 z-[5] cursor-default bg-transparent"
        onClick={handleVideoTap}
      />

      {/* Sound toggle button — always visible, top-right (TikTok style) */}
      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-3 top-4 z-[10] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
        aria-label={muted ? "Sesi aç" : "Sesi kapat"}
      >
        {muted
          ? <IconVolumeOff size={20} className="text-white" />
          : <IconVolumeOn  size={20} className="text-white" />
        }
      </button>

      {loading && isActive && (
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
