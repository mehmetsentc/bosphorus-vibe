"use client";

import { useState } from "react";
import { TagPeoplePicker } from "@/components/tags/TagPeoplePicker";
import { StoryCategoryPicker } from "@/components/stories/StoryCategoryPicker";
import { VideoCoverPicker } from "@/components/upload/VideoCoverPicker";
import { UploadSettingRow } from "@/components/upload/UploadSettingRow";
import { useT } from "@/components/providers/I18nProvider";
import { BRAND_NAME } from "@/lib/brand";
import type { UploadKind } from "@/components/upload/CreateUploadFlow";
import type { DraftStatus } from "@/lib/hooks/useDraftUpload";
import type { PostTag, StoryCategory } from "@/types";

type UploadShareScreenProps = {
  kind: UploadKind;
  title: string;
  preview: string;
  coverPreview: string | null;
  isVideo: boolean;
  file: File;
  caption: string;
  onCaptionChange: (value: string) => void;
  taggedPeople: PostTag[];
  onTaggedPeopleChange: (tags: PostTag[]) => void;
  onCoverChange: (blob: Blob) => void;
  storyCategory?: StoryCategory;
  onStoryCategoryChange?: (cat: StoryCategory) => void;
  storyCategoryLabels?: Record<StoryCategory, string>;
  draftStatus: DraftStatus;
  draftProgress: number;
  uploading: boolean;
  uploadProgress: number;
  error: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function UploadShareScreen({
  kind,
  title,
  preview,
  coverPreview,
  isVideo,
  file,
  caption,
  onCaptionChange,
  taggedPeople,
  onTaggedPeopleChange,
  onCoverChange,
  storyCategory,
  onStoryCategoryChange,
  storyCategoryLabels,
  draftStatus,
  draftProgress,
  uploading,
  uploadProgress,
  error,
  onBack,
  onSaveDraft,
  onPublish,
}: UploadShareScreenProps) {
  const t = useT();
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const thumbSrc = coverPreview ?? preview;

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-black text-white">
      <header className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onBack} className="text-2xl font-light" aria-label={t("back")}>
          ←
        </button>
        <h1 className="text-base font-semibold">{title}</h1>
        <div className="w-8" />
      </header>

      {draftStatus === "uploading" && (
        <div className="shrink-0 px-4 pb-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
            <span>{t("draftUploading")}</span>
            <span>{draftProgress}%</span>
          </div>
          <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#0095f6] transition-all" style={{ width: `${draftProgress}%` }} />
          </div>
        </div>
      )}
      {draftStatus === "ready" && (
        <p className="shrink-0 px-4 pb-2 text-[11px] text-[#0095f6]">{t("draftUploadReady")}</p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col items-center pb-5 pt-1">
          <div className="relative aspect-[9/16] w-full max-w-[min(58vw,240px)] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            {isVideo ? (
              <video
                src={thumbSrc}
                className="h-full w-full object-cover"
                muted
                playsInline
                autoPlay
                loop
                preload="auto"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbSrc} alt="" className="h-full w-full object-cover" />
            )}
            {isVideo && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="absolute left-1/2 top-3 -translate-x-1/2 rounded-lg bg-black/60 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm"
                >
                  {t("uploadPreview")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCoverEditor(true)}
                  className="absolute bottom-3 left-1/2 w-[calc(100%-16px)] -translate-x-1/2 rounded-lg bg-black/60 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                >
                  {t("uploadEditCover")}
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder={t("addCaptionPlaceholder")}
          rows={4}
          className="mb-4 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-white/35"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            className="shrink-0 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-white/85"
          >
            # {t("uploadTopicTags")}
          </button>
          {kind === "reel" && (
            <button
              type="button"
              className="shrink-0 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-white/85"
            >
              {t("uploadLinkReel")}
            </button>
          )}
        </div>

        <div className="mt-1">
          <UploadSettingRow
            icon="👤"
            label={t("uploadTagPeople")}
            value={taggedPeople.length ? t("tagPeopleCount", { count: String(taggedPeople.length) }) : undefined}
            onClick={() => setShowTagPicker((v) => !v)}
          />
          {showTagPicker && (
            <div className="mb-2 rounded-xl bg-white/[0.04] p-3">
              <TagPeoplePicker
                value={taggedPeople}
                onChange={onTaggedPeopleChange}
                variant="dark"
              />
            </div>
          )}

          <UploadSettingRow icon="📍" label={t("uploadAddLocation")} onClick={() => {}} />
          <div className="mb-3 flex gap-2 overflow-x-auto pl-9">
            {[BRAND_NAME, "Bosphorus Sorgun Hotel"].map((loc) => (
              <button
                key={loc}
                type="button"
                className="shrink-0 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs text-white/75"
              >
                {loc}
              </button>
            ))}
          </div>

          <UploadSettingRow
            icon="↗"
            label={t("uploadShareElsewhere")}
            value={BRAND_NAME}
            onClick={() => {}}
          />
        </div>

        {kind === "story" && storyCategory && onStoryCategoryChange && storyCategoryLabels && (
          <StoryCategoryPicker
            value={storyCategory}
            onChange={onStoryCategoryChange}
            labels={storyCategoryLabels}
            disabled={uploading}
            className="mt-4"
          />
        )}
      </div>

      <div className="shrink-0 border-t border-white/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={onSaveDraft}
            className="flex-1 rounded-xl bg-white/[0.12] py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t("saveDraft")}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={onPublish}
            className="flex-1 rounded-xl bg-[#0095f6] py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {uploading ? t("uploading") : t("shareAction")}
          </button>
        </div>

        {uploading && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-[#0095f6] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
        {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 text-2xl text-white"
          >
            ✕
          </button>
          {isVideo ? (
            <video src={preview} className="max-h-full max-w-full" autoPlay loop playsInline controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-full max-w-full object-contain" />
          )}
        </div>
      )}

      {showCoverEditor && isVideo && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button type="button" onClick={() => setShowCoverEditor(false)} className="text-sm text-[#0095f6]">
              {t("cancel")}
            </button>
            <span className="font-semibold">{t("uploadEditCover")}</span>
            <button type="button" onClick={() => setShowCoverEditor(false)} className="text-sm font-semibold text-[#0095f6]">
              {t("done")}
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <VideoCoverPicker
              file={file}
              previewUrl={preview}
              onCoverChange={(blob, url) => {
                onCoverChange(blob);
                void url;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
