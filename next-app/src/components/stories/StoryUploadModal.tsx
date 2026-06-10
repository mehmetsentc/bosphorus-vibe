"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import {
  createStory,
  uploadStoryImage,
  uploadStoryVideo,
} from "@/lib/services/stories";
import { StoryCategoryPicker } from "@/components/stories/StoryCategoryPicker";
import { StoryMediaDisplay } from "@/components/stories/StoryMediaDisplay";
import { STORY_MEDIA_CLASS } from "@/lib/utils/story-media";
import { BRAND_NAME } from "@/lib/brand";
import { isImageFile, isVideoFile } from "@/lib/utils/media-compress";
import type { StoryCategory } from "@/types";

const MAX_VIDEO_MB = 200;
const MAX_IMAGE_MB = 50;

type Step = "gallery" | "edit";

type StoryUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function StoryUploadModal({
  open,
  onClose,
  onSuccess,
}: StoryUploadModalProps) {
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("gallery");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [textOverlay, setTextOverlay] = useState("");
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [storyCategory, setStoryCategory] = useState<StoryCategory>("vibe");
  const [recentFiles, setRecentFiles] = useState<
    { file: File; url: string; isVideo: boolean }[]
  >([]);

  useEffect(() => {
    if (!open) {
      setStep("gallery");
      setFile(null);
      setPreview(null);
      setDescription("");
      setTextOverlay("");
      setShowTextOverlay(false);
      setMuted(true);
      setProgress(0);
      setError("");
      setStoryCategory("vibe");
    }
  }, [open]);

  const storyCategoryLabels = useMemo(
    (): Record<StoryCategory, string> => ({
      vibe: BRAND_NAME,
      reels: t("navReels"),
      events: t("eventsHighlight"),
    }),
    [t],
  );

  useEffect(() => {
    return () => {
      recentFiles.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [recentFiles]);

  const handleFile = useCallback(
    (next: File | null) => {
      setError("");
      if (!next) return;

      const isVideo = isVideoFile(next);
      const isImage = isImageFile(next);
      if (!isVideo && !isImage) {
        setError(t("mediaTypeError"));
        return;
      }
      if (isVideo && next.size > MAX_VIDEO_MB * 1024 * 1024) {
        setError(t("storyVideoSizeError"));
        return;
      }
      if (isImage && next.size > MAX_IMAGE_MB * 1024 * 1024) {
        setError(t("imageSizeError"));
        return;
      }

      const url = URL.createObjectURL(next);
      setFile(next);
      setPreview(url);
      setStep("edit");

      setRecentFiles((prev) => {
        const entry = { file: next, url, isVideo };
        const filtered = prev.filter((p) => p.file.name !== next.name);
        return [entry, ...filtered].slice(0, 11);
      });
    },
    [t],
  );

  async function handleUpload(closeFriends = false) {
    if (!file || !user || !canUpload) return;
    setUploading(true);
    setError("");
    try {
      const isVideo = isVideoFile(file);
      let photoUrl: string | undefined;
      let videoOriginalUrl: string | undefined;
      let videoLowUrl: string | undefined;

      if (isVideo) {
        const { originalUrl, lowUrl, thumbnailUrl } = await uploadStoryVideo(
          file,
          user.uid,
          setProgress,
        );
        videoOriginalUrl = originalUrl;
        videoLowUrl = lowUrl;
        photoUrl = thumbnailUrl;
      } else {
        photoUrl = await uploadStoryImage(file, user.uid, setProgress);
      }

      const caption = [textOverlay, description].filter(Boolean).join("\n").trim();

      await createStory({
        userId: user.uid,
        photoUrl,
        videoOriginalUrl,
        videoLowUrl,
        storyCategory,
        description: closeFriends ? `[close-friends] ${caption}` : caption,
      });

      onSuccess();
      onClose();
    } catch {
      setError(t("storyUploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  const photoUrl = profile?.photo_url || user?.photoURL || "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-black"
        >
          {step === "gallery" ? (
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl text-white"
                  aria-label={t("close")}
                >
                  ✕
                </button>
                <h1 className="text-base font-semibold text-white">
                  {t("addToStory")}
                </h1>
                <div className="w-8" />
              </header>

              <div className="flex gap-2 px-3 py-2">
                <button
                  type="button"
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                >
                  {t("storyRecents")} ▾
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-auto rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white"
                >
                  {t("storySelect")}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  if (picked) handleFile(picked);
                  e.target.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const picked = e.target.files?.[0];
                  if (picked) handleFile(picked);
                  e.target.value = "";
                }}
              />

              <div className="flex-1 overflow-y-auto px-1 pb-4">
                <div className="grid grid-cols-3 gap-0.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex aspect-[3/4] items-center justify-center bg-white/5"
                  >
                    <span className="text-3xl text-white">📷</span>
                  </button>
                  {recentFiles.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setFile(item.file);
                        setPreview(item.url);
                        setStep("edit");
                      }}
                      className="relative aspect-[3/4] overflow-hidden bg-white/5"
                    >
                      {item.isVideo ? (
                        <video
                          src={item.url}
                          className={`h-full w-full ${STORY_MEDIA_CLASS}`}
                          muted
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt=""
                          className={`h-full w-full ${STORY_MEDIA_CLASS}`}
                        />
                      )}
                      {item.isVideo && (
                        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                          ▶
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-white/5 text-white/60"
                  >
                    <span className="text-2xl">+</span>
                    <span className="px-2 text-center text-[10px]">
                      {t("selectStoryMedia")}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="px-4 pb-4 text-center text-sm text-red-400">{error}</p>
              )}
            </div>
          ) : (
            <div className="relative h-full w-full">
              <button
                type="button"
                onClick={() => setStep("gallery")}
                className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 text-2xl text-white drop-shadow-lg"
                aria-label={t("back")}
              >
                ✕
              </button>

              <div className="absolute inset-0 bg-black">
                {file && isVideoFile(file) ? (
                  <StoryMediaDisplay
                    src={preview ?? ""}
                    isVideo
                    autoPlay
                    loop
                    muted={muted}
                    playsInline
                  />
                ) : (
                  <StoryMediaDisplay src={preview ?? ""} />
                )}
                {showTextOverlay && textOverlay && (
                  <div className="absolute inset-x-0 top-1/3 z-20 px-6 text-center">
                    <p className="text-xl font-bold text-white drop-shadow-lg">
                      {textOverlay}
                    </p>
                  </div>
                )}
              </div>

              {/* Right toolbar */}
              <div className="absolute right-2 top-1/4 z-30 flex flex-col items-center gap-4">
                {[
                  { icon: "Aa", action: () => setShowTextOverlay((v) => !v) },
                  { icon: "☺", action: () => {} },
                  { icon: "♫", action: () => {} },
                  { icon: muted ? "🔇" : "🔊", action: () => setMuted((m) => !m) },
                ].map((tool) => (
                  <button
                    key={tool.icon}
                    type="button"
                    onClick={tool.action}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-sm text-white backdrop-blur-sm"
                  >
                    {tool.icon}
                  </button>
                ))}
              </div>

              {/* Bottom editor */}
              <div className="absolute bottom-0 left-0 right-0 z-30 space-y-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16">
                <StoryCategoryPicker
                  value={storyCategory}
                  onChange={setStoryCategory}
                  labels={storyCategoryLabels}
                  disabled={uploading}
                />
                {showTextOverlay && (
                  <input
                    type="text"
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    placeholder={t("storyTextPlaceholder")}
                    className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50"
                  />
                )}
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("storyCaptionPlaceholder")}
                  maxLength={120}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleUpload(false)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white/15 py-2 pl-2 pr-3 backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
                  >
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-vibe"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vibe text-xs font-bold text-black">
                        +
                      </div>
                    )}
                    <span className="truncate text-xs font-semibold text-white">
                      {t("storyYourStories")}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleUpload(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-900/80 py-2 pl-2 pr-3 backdrop-blur-sm transition hover:bg-emerald-800/80 disabled:opacity-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                      ★
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {t("storyCloseFriends")}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={uploading || !file}
                    onClick={() => handleUpload(false)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vibe text-white transition hover:brightness-110 disabled:opacity-40"
                    aria-label={t("shareStory")}
                  >
                    {uploading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <span className="text-lg">→</span>
                    )}
                  </button>
                </div>

                {uploading && (
                  <div className="h-1 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-vibe transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {error && <p className="text-center text-xs text-red-400">{error}</p>}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
