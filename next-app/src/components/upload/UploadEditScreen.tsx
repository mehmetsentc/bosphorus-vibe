"use client";

import { type RefObject } from "react";
import { useT } from "@/components/providers/I18nProvider";
import { LocalVideoPreview } from "@/components/upload/LocalVideoPreview";
import type { DraftStatus } from "@/lib/hooks/useDraftUpload";

const STICKER_OPTIONS = ["❤️", "🔥", "✨", "😂", "🙌", "👏", "💯", "🎉", "📍", "☀️", "🌊", "🎵"] as const;

const TOOLS = [
  { key: "text" as const, icon: "Aa" },
  { key: "sticker" as const, icon: "☺" },
];

type UploadEditScreenProps = {
  file: File;
  preview: string;
  poster?: string | null;
  isVideo: boolean;
  textOverlay: string;
  onTextOverlayChange: (value: string) => void;
  showTextTool: boolean;
  sticker: string | null;
  onStickerChange: (value: string | null) => void;
  showStickerTool: boolean;
  draftStatus: DraftStatus;
  draftProgress: number;
  videoRef?: RefObject<HTMLVideoElement>;
  onClose: () => void;
  onNext: () => void;
  onDurationKnown?: (seconds: number) => void;
  onToggleTextTool: () => void;
  onToggleStickerTool: () => void;
};

export function UploadEditScreen({
  file,
  preview,
  poster,
  isVideo,
  textOverlay,
  onTextOverlayChange,
  showTextTool,
  sticker,
  onStickerChange,
  showStickerTool,
  draftStatus,
  draftProgress,
  videoRef,
  onClose,
  onNext,
  onDurationKnown,
  onToggleTextTool,
  onToggleStickerTool,
}: UploadEditScreenProps) {
  const t = useT();

  const toolLabels: Record<(typeof TOOLS)[number]["key"], string> = {
    text: t("uploadToolText"),
    sticker: t("uploadToolSticker"),
  };

  function handleToolClick(key: (typeof TOOLS)[number]["key"]) {
    if (key === "text") onToggleTextTool();
    else onToggleStickerTool();
  }

  return (
    <div className="relative h-full min-h-[100dvh] w-full bg-black">
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

      <div className="absolute inset-0 z-0 bg-black">
        {isVideo ? (
          <LocalVideoPreview
            file={file}
            poster={poster ?? undefined}
            videoRef={videoRef}
            className="h-full w-full"
            objectFit="cover"
            onDurationKnown={onDurationKnown}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        )}

        {textOverlay && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 px-8 text-center">
            <p className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {textOverlay}
            </p>
          </div>
        )}

        {sticker && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <span className="text-6xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">{sticker}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-[5.5rem] left-0 right-0 z-30">
        {showTextTool && (
          <div className="mb-3 px-4">
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => onTextOverlayChange(e.target.value)}
              placeholder={t("storyTextPlaceholder")}
              autoFocus
              className="w-full rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-center text-lg font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/40"
            />
          </div>
        )}

        {showStickerTool && (
          <div className="mb-3 px-4">
            <div className="flex gap-2 overflow-x-auto rounded-xl bg-black/50 p-3 backdrop-blur-md scrollbar-none">
              {STICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onStickerChange(sticker === emoji ? null : emoji)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition ${
                    sticker === emoji
                      ? "bg-white/20 ring-2 ring-[#0095f6]"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-6 px-4 pb-2">
          {TOOLS.map((tool) => {
            const active =
              (tool.key === "text" && showTextTool) ||
              (tool.key === "sticker" && showStickerTool);
            return (
              <button
                key={tool.key}
                type="button"
                onClick={() => handleToolClick(tool.key)}
                className="flex w-[72px] flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm text-white backdrop-blur-sm ring-1 transition ${
                    active
                      ? "bg-white/20 ring-[#0095f6]"
                      : "bg-black/55 ring-white/10"
                  }`}
                >
                  {tool.icon}
                </span>
                <span className="max-w-[72px] truncate text-[10px] text-white/75">
                  {toolLabels[tool.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-full bg-[#0095f6] py-3.5 text-sm font-semibold text-white"
        >
          {t("next")} →
        </button>
      </div>
    </div>
  );
}
