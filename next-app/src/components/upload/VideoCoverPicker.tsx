"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  captureVideoFrameAtTime,
  isImageFile,
} from "@/lib/utils/media-compress";
import { useT } from "@/components/providers/I18nProvider";

type VideoCoverPickerProps = {
  file: File;
  previewUrl: string;
  onCoverChange: (blob: Blob, previewUrl: string) => void;
  className?: string;
};

export function VideoCoverPicker({
  previewUrl,
  onCoverChange,
  className = "",
}: VideoCoverPickerProps) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [duration, setDuration] = useState(1);
  const [coverTime, setCoverTime] = useState(0.1);
  const [busy, setBusy] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const captureAt = useCallback(
    async (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      setBusy(true);
      try {
        const blob = await captureVideoFrameAtTime(video, time);
        onCoverChange(blob, previewUrl);
      } catch {
        // keep showing video frame even if canvas export fails
      } finally {
        setBusy(false);
      }
    },
    [onCoverChange, previewUrl],
  );

  const captureAtRef = useRef(captureAt);
  captureAtRef.current = captureAt;

  useEffect(() => {
    setVideoReady(false);
    const video = videoRef.current;
    if (!video) return;

    let done = false;
    const onReady = () => {
      if (done) return;
      done = true;
      const d = video.duration || 1;
      setDuration(d);
      setVideoReady(true);
      void captureAtRef.current(0.1);
    };

    video.muted = true;
    video.setAttribute("muted", "");
    if (video.readyState === 0) video.load();

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    void video.play().then(() => video.pause()).catch(() => {});

    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
    };
  }, [previewUrl]);

  async function handleScrub(next: number) {
    setCoverTime(next);
    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = next;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
          window.setTimeout(resolve, 300);
        });
      } catch {
        // ignore seek errors on iOS
      }
    }
    await captureAt(next);
  }

  async function handleCustomImage(imageFile: File) {
    if (!isImageFile(imageFile)) return;
    const url = URL.createObjectURL(imageFile);
    onCoverChange(imageFile, url);
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-medium text-white/70">{t("videoCoverTitle")}</p>

      <div className="relative mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
        <video
          ref={videoRef}
          key={previewUrl}
          src={previewUrl}
          className={`h-full w-full object-cover ${videoReady ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
          preload="auto"
        />
        {!videoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-[10px] text-white/50">
            …
          </div>
        )}
        {busy && videoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-[10px] text-white">
            …
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[10px] text-white/50">
          {t("videoCoverScrub")}
        </label>
        <input
          type="range"
          min={0.05}
          max={Math.max(0.1, duration - 0.05)}
          step={0.05}
          value={coverTime}
          disabled={busy || !videoReady}
          onChange={(e) => void handleScrub(Number(e.target.value))}
          className="h-1 w-full accent-vibe"
        />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-xl border border-white/15 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/5"
      >
        {t("videoCoverPickImage")}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const img = e.target.files?.[0];
          if (img) void handleCustomImage(img);
          e.target.value = "";
        }}
      />
    </div>
  );
}
