"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/providers/I18nProvider";
import type { DraftStatus } from "@/lib/hooks/useDraftUpload";

type UploadEditScreenProps = {
  preview: string;
  poster?: string | null;
  isVideo: boolean;
  muted: boolean;
  textOverlay: string;
  onTextOverlayChange: (value: string) => void;
  showTextTool: boolean;
  draftStatus: DraftStatus;
  draftProgress: number;
  onClose: () => void;
  onNext: () => void;
  onToggleMute: () => void;
  onToggleTextTool: () => void;
};

const TOOLS = [
  { key: "text", icon: "Aa" },
  { key: "sticker", icon: "☺" },
  { key: "audio", icon: "♫" },
  { key: "clips", icon: "▣" },
  { key: "effects", icon: "✦" },
  { key: "photo", icon: "🖼" },
  { key: "overlay", icon: "▢" },
  { key: "captions", icon: "Cc" },
] as const;

export function UploadEditScreen({
  preview,
  poster,
  isVideo,
  muted,
  textOverlay,
  onTextOverlayChange,
  showTextTool,
  draftStatus,
  draftProgress,
  onClose,
  onNext,
  onToggleMute,
  onToggleTextTool,
}: UploadEditScreenProps) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setVideoReady(false);
    const el = videoRef.current;
    if (!el || !isVideo) return;

    el.muted = true;
    el.setAttribute("muted", "");
    if (el.readyState === 0) el.load();

    const play = () => {
      void el.play().catch(() => {});
    };
    play();
    el.addEventListener("canplay", play, { once: true });
    el.addEventListener("loadeddata", play, { once: true });

    return () => {
      el.removeEventListener("canplay", play);
      el.removeEventListener("loadeddata", play);
    };
  }, [preview, isVideo]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !isVideo) return;
    el.muted = muted;
    if (muted) el.setAttribute("muted", "");
    else el.removeAttribute("muted");
  }, [muted, isVideo]);

  const toolLabels: Record<(typeof TOOLS)[number]["key"], string> = {
    text: t("uploadToolText"),
    sticker: t("uploadToolSticker"),
    audio: t("uploadToolAudio"),
    clips: t("uploadToolClips"),
    effects: t("uploadToolEffects"),
    photo: t("uploadToolPhoto"),
    overlay: t("uploadToolOverlay"),
    captions: t("uploadToolCaptions"),
  };

  return (
    <div className="relative h-full w-full bg-black">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 text-2xl font-light text-white drop-shadow-lg"
        aria-label={t("close")}
      >
        ✕
      </button>

      {draftStatus === "uploading" && (
        <div className="absolute left-4 right-4 top-[max(3rem,env(safe-area-inset-top))] z-30">
          <div className="flex items-center justify-between text-[10px] text-white/60">
            <span>{t("draftUploading")}</span>
            <span>{draftProgress}%</span>
          </div>
          <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#0095f6] transition-all" style={{ width: `${draftProgress}%` }} />
          </div>
        </div>
      )}
      {draftStatus === "ready" && (
        <p className="absolute left-4 right-4 top-[max(3rem,env(safe-area-inset-top))] z-30 text-center text-[10px] text-[#0095f6]">
          {t("draftUploadReady")}
        </p>
      )}

      <div className="absolute inset-0 overflow-hidden bg-black">
        {isVideo ? (
          <>
            {poster && !videoReady && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <video
              ref={videoRef}
              key={preview}
              src={preview}
              poster={poster ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              playsInline
              muted
              preload="auto"
              onPlaying={() => setVideoReady(true)}
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        )}
        {showTextTool && textOverlay && (
          <div className="absolute inset-x-0 top-1/3 z-20 px-8 text-center">
            <p className="text-2xl font-bold text-white drop-shadow-lg">{textOverlay}</p>
          </div>
        )}
      </div>

      <div className="absolute left-4 right-4 top-[max(3.5rem,env(safe-area-inset-top))] z-20">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl bg-black/45 px-3 py-2 backdrop-blur-md"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
            ♫
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs font-semibold text-white">
              {t("uploadRecommendedSound")}
            </span>
            <span className="block truncate text-[10px] text-white/55">
              {t("uploadTapToApplySound")}
            </span>
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[11.5rem] z-20 flex flex-col items-center text-white/60">
        <span className="text-lg">⌃</span>
        <span className="text-xs">{t("swipeToEdit")}</span>
      </div>

      <div className="absolute bottom-[5.5rem] left-0 right-0 z-30">
        {showTextTool && (
          <div className="mb-3 px-4">
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => onTextOverlayChange(e.target.value)}
              placeholder={t("storyTextPlaceholder")}
              className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-center text-lg font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/40"
            />
          </div>
        )}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              type="button"
              onClick={() => {
                if (tool.key === "text") onToggleTextTool();
                else if (tool.key === "audio") onToggleMute();
              }}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/55 text-sm text-white backdrop-blur-sm ring-1 ring-white/10">
                {tool.key === "audio" ? (muted ? "🔇" : "🔊") : tool.icon}
              </span>
              <span className="max-w-[72px] truncate text-[10px] text-white/75">
                {tool.key === "audio" ? t("uploadToolAudio") : toolLabels[tool.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80"
        >
          {t("openInEdits")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[#0095f6] px-6 py-2.5 text-sm font-semibold text-white"
        >
          {t("next")} →
        </button>
      </div>
    </div>
  );
}
