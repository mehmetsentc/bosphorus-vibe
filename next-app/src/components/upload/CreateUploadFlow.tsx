"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import {
  createImagePost,
  createVideoPost,
  uploadImagePost,
  uploadVideoPost,
} from "@/lib/services/firestore";
import { useDraftUpload } from "@/lib/hooks/useDraftUpload";
import {
  createStory,
  uploadStoryImage,
  uploadStoryVideo,
} from "@/lib/services/stories";
import { StoryCategoryPicker } from "@/components/stories/StoryCategoryPicker";
import { TagPeoplePicker } from "@/components/tags/TagPeoplePicker";
import { isVideoFile, validateMediaSize } from "@/lib/utils/media-compress";
import { parseStoryCategory } from "@/lib/utils/story-categories";
import { BRAND_NAME } from "@/lib/brand";
import { IconGrid, IconPlus, IconReels } from "@/components/icons/Icons";
import type { PostTag, StoryCategory } from "@/types";

export type UploadKind = "post" | "reel" | "story";

type Step = "menu" | "gallery" | "edit" | "share";

type RecentItem = {
  file: File;
  url: string;
  isVideo: boolean;
  duration?: string;
};

const STORY_MAX_VIDEO_MB = 200;
const STORY_MAX_IMAGE_MB = 50;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CreateUploadFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as UploadKind | null;
  const initialStoryCategory = parseStoryCategory(searchParams.get("category"));
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const t = useT();
  const { locale } = useI18n();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [kind, setKind] = useState<UploadKind | null>(
    initialType === "post" || initialType === "reel" || initialType === "story"
      ? initialType
      : null,
  );
  const [step, setStep] = useState<Step>(initialType ? "gallery" : "menu");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [textOverlay, setTextOverlay] = useState("");
  const [showTextTool, setShowTextTool] = useState(false);
  const [muted, setMuted] = useState(true);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Start uploading immediately when a file is selected (draft upload).
  // For stories we skip this since they use different upload paths.
  const draft = useDraftUpload(file, user?.uid, kind !== "story");
  const [storyCategory, setStoryCategory] = useState<StoryCategory>(initialStoryCategory);
  const [taggedPeople, setTaggedPeople] = useState<PostTag[]>([]);

  useEffect(() => {
    if (kind === "story") {
      setStoryCategory(parseStoryCategory(searchParams.get("category")));
    }
  }, [kind, searchParams]);

  const storyCategoryLabels = useMemo(
    (): Record<StoryCategory, string> => ({
      vibe: BRAND_NAME,
      reels: t("navReels"),
      events: t("eventsHighlight"),
    }),
    [t],
  );

  useEffect(() => {
    if (!canUpload) {
      router.replace("/welcome?reason=auth-required");
    }
  }, [canUpload, router]);

  useEffect(() => {
    return () => {
      recentItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [recentItems]);

  const accept =
    kind === "reel" ? "video/*" : "image/*,video/*";

  const galleryTitle =
    kind === "reel"
      ? t("newReelVideo")
      : kind === "story"
        ? t("addToStory")
        : t("createNewPost");

  const handleFile = useCallback(
    (next: File | null) => {
      setError("");
      if (!next || !kind) return;

      if (kind === "reel" && !isVideoFile(next)) {
        setError(t("replaceVideoOnly"));
        return;
      }

      const sizeError = validateMediaSize(next, locale);
      if (sizeError) {
        setError(sizeError);
        return;
      }

      if (kind === "story") {
        const isVideo = isVideoFile(next);
        if (isVideo && next.size > STORY_MAX_VIDEO_MB * 1024 * 1024) {
          setError(t("storyVideoSizeError"));
          return;
        }
        if (!isVideo && next.size > STORY_MAX_IMAGE_MB * 1024 * 1024) {
          setError(t("imageSizeError"));
          return;
        }
      }

      const url = URL.createObjectURL(next);
      const isVideo = isVideoFile(next);
      setFile(next);
      setPreview(url);
      setStep("edit");

      setRecentItems((prev) => {
        const filtered = prev.filter((p) => p.file.name !== next.name);
        return [{ file: next, url, isVideo }, ...filtered].slice(0, 20);
      });

      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => {
          const duration = formatDuration(video.duration);
          setRecentItems((prev) =>
            prev.map((item) =>
              item.url === url ? { ...item, duration } : item,
            ),
          );
        };
      }
    },
    [kind, locale, t],
  );

  function selectKind(next: UploadKind) {
    setKind(next);
    setStep("gallery");
    setError("");
    setTaggedPeople([]);
  }

  function closeFlow() {
    router.push("/home");
  }

  async function handlePublish() {
    if (!file || !user || !kind) return;
    setUploading(true);
    setError("");
    setProgress(0);

    const fullCaption = [textOverlay, caption].filter(Boolean).join("\n").trim();

    try {
      // ── Story: always upload fresh (separate upload paths) ──────────────
      if (kind === "story") {
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
        await createStory({
          userId: user.uid,
          photoUrl,
          videoOriginalUrl,
          videoLowUrl,
          storyCategory,
          description: fullCaption,
          tags: taggedPeople,
        });
        router.push("/home");
        return;
      }

      // ── Post / Reel: use draft upload result if ready ────────────────────
      let originalUrl: string;
      let lowUrl: string;
      let thumbnailUrl: string | undefined;

      if (draft.status === "ready" && draft.result) {
        // Draft finished in the background — only a Firestore write needed.
        setProgress(98);
        originalUrl = draft.result.originalUrl;
        lowUrl = draft.result.lowUrl;
        thumbnailUrl = draft.result.isVideo ? draft.result.thumbnailUrl : undefined;
      } else {
        // Draft still uploading or errored — fall back to fresh upload so
        // the user is never stuck.
        if (kind === "reel" || isVideoFile(file)) {
          const result = await uploadVideoPost(file, user.uid, setProgress);
          originalUrl = result.originalUrl;
          lowUrl = result.lowUrl;
          thumbnailUrl = result.thumbnailUrl;
        } else {
          const result = await uploadImagePost(file, user.uid, setProgress);
          originalUrl = result.originalUrl;
          lowUrl = result.lowUrl;
        }
      }

      if (kind === "reel" || isVideoFile(file)) {
        await createVideoPost(
          originalUrl,
          lowUrl,
          thumbnailUrl ?? "",
          fullCaption,
          user.uid,
          taggedPeople,
        );
      } else {
        await createImagePost(originalUrl, lowUrl, fullCaption, user.uid, taggedPeople);
      }

      router.push(kind === "reel" ? "/reels" : "/home");
    } catch (err) {
      console.error("[CreateUpload]", err);
      setError(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  const photoUrl = profile?.photo_url || user?.photoURL || "";

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-black text-white">
      <AnimatePresence mode="wait">
        {step === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col"
          >
            <div className="flex-1 bg-black/60" onClick={closeFlow} aria-hidden />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="rounded-t-3xl bg-[#1c1c1c] pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto mb-4 mt-2 h-1 w-10 rounded-full bg-white/20" />
              <h2 className="mb-4 text-center text-base font-bold">
                {t("createTitle")}
              </h2>
              <div className="divide-y divide-white/10">
                <MenuRow
                  icon={<IconReels size={24} />}
                  label={t("createReel")}
                  onClick={() => selectKind("reel")}
                />
                <MenuRow
                  icon={<IconGrid size={24} />}
                  label={t("createPost")}
                  onClick={() => selectKind("post")}
                />
                <MenuRow
                  icon={
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white">
                      <IconPlus size={14} />
                    </span>
                  }
                  label={t("createStory")}
                  onClick={() => selectKind("story")}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === "gallery" && kind && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full flex-col"
          >
            <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                type="button"
                onClick={() => {
                  if (initialType) closeFlow();
                  else setStep("menu");
                }}
                className="text-2xl leading-none"
                aria-label={t("close")}
              >
                ✕
              </button>
              <h1 className="text-base font-semibold">{galleryTitle}</h1>
              <span className="w-6" />
            </header>

            <div className="flex items-center justify-between px-4 py-2">
              <button type="button" className="text-sm font-semibold">
                {t("storyRecents")} ▾
              </button>
              <button
                type="button"
                onClick={closeFlow}
                className="text-sm text-white/70"
              >
                {t("cancel")}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept={accept}
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            <div className="flex-1 overflow-y-auto px-0.5 pb-24">
              <div className="grid grid-cols-3 gap-0.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex aspect-[3/4] items-center justify-center bg-white/5"
                >
                  <span className="text-3xl">📷</span>
                </button>
                {recentItems.map((item) => (
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
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    {item.isVideo && item.duration && (
                      <span className="absolute bottom-1.5 right-1.5 text-[11px] font-medium drop-shadow">
                        {item.duration}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-1 bg-white/5 text-white/50"
                >
                  <span className="text-2xl">+</span>
                  <span className="px-2 text-center text-[10px]">
                    {t("selectFromGallery")}
                  </span>
                </button>
              </div>
            </div>

            {kind === "reel" && (
              <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 flex justify-center px-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white/15 px-8 py-3 text-xs font-bold tracking-wider backdrop-blur-sm"
                >
                  {t("reelsVideoLabel")}
                </button>
              </div>
            )}

            {error && (
              <p className="px-4 pb-4 text-center text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        )}

        {(step === "edit" || step === "share") && preview && file && kind && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full w-full"
          >
            <button
              type="button"
              onClick={() => setStep("gallery")}
              className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 text-2xl drop-shadow-lg"
              aria-label={t("back")}
            >
              ✕
            </button>

            <div className="absolute inset-0 bg-black">
              {isVideoFile(file) ? (
                <video
                  src={preview}
                  className="h-full w-full object-contain"
                  autoPlay
                  loop
                  playsInline
                  muted={muted}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-contain" />
              )}
              {showTextTool && textOverlay && (
                <div className="absolute inset-x-0 top-1/3 z-20 px-8 text-center">
                  <p className="text-2xl font-bold drop-shadow-lg">{textOverlay}</p>
                </div>
              )}
            </div>

            {step === "edit" && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-32 z-20 flex flex-col items-center text-white/70">
                  <span className="text-lg">⌃</span>
                  <span className="text-xs">{t("swipeToEdit")}</span>
                </div>

                <div className="absolute bottom-24 left-0 right-0 z-30 flex justify-center gap-2 overflow-x-auto px-4 pb-2">
                  {[
                    { label: "Aa", action: () => setShowTextTool((v) => !v) },
                    { label: "☺", action: () => {} },
                    { label: "♫", action: () => {} },
                    { label: muted ? "🔇" : "🔊", action: () => setMuted((m) => !m) },
                  ].map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      onClick={tool.action}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/50 text-sm backdrop-blur-sm"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                  <span className="text-xs text-white/50">{t("openInEdits")}</span>
                  <button
                    type="button"
                    onClick={() => setStep("share")}
                    className="rounded-full bg-vibe px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    {t("next")} →
                  </button>
                </div>
              </>
            )}

            {step === "share" && (
              <div className="absolute inset-0 z-40 flex flex-col bg-black/95">
                <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                  <button
                    type="button"
                    onClick={() => setStep("edit")}
                    className="text-2xl"
                    aria-label={t("back")}
                  >
                    ←
                  </button>
                  <h2 className="text-base font-semibold">{t("shareAction")}</h2>
                  <div className="w-8" />
                </header>

                {/* Draft upload progress bar (shown while user writes caption) */}
                {kind !== "story" && draft.status === "uploading" && (
                  <div className="px-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-white/50">
                        Arka planda yükleniyor…
                      </span>
                      <span className="text-[11px] text-white/50">
                        {draft.progress}%
                      </span>
                    </div>
                    <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-vibe transition-all duration-300"
                        style={{ width: `${draft.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {kind !== "story" && draft.status === "ready" && (
                  <p className="px-4 pb-2 text-[11px] text-vibe">
                    ✓ Yükleme tamamlandı — yayınlamak için hazır
                  </p>
                )}

                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
                  <div className="mx-auto h-40 w-28 overflow-hidden rounded-lg bg-white/5">
                    {isVideoFile(file) ? (
                      <video
                        src={preview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={t("writeCaption")}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/40"
                  />

                  <TagPeoplePicker
                    value={taggedPeople}
                    onChange={setTaggedPeople}
                    variant="dark"
                  />

                  {showTextTool && (
                    <input
                      type="text"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder={t("storyTextPlaceholder")}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/40"
                    />
                  )}
                </div>

                <div className="border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                  {kind === "story" && (
                    <StoryCategoryPicker
                      value={storyCategory}
                      onChange={setStoryCategory}
                      labels={storyCategoryLabels}
                      disabled={uploading}
                      className="mb-3"
                    />
                  )}
                  {kind === "story" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={handlePublish}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white/15 py-2 pl-2 pr-3 disabled:opacity-50"
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
                        <span className="truncate text-xs font-semibold">
                          {t("storyYourStories")}
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={handlePublish}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-vibe disabled:opacity-40"
                      >
                        {uploading ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          "→"
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={handlePublish}
                      className="w-full rounded-xl gold-gradient py-3.5 text-sm font-bold text-black disabled:opacity-40"
                    >
                      {uploading ? t("uploading") : t("shareAction")}
                    </button>
                  )}

                  {uploading && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-vibe transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {error && (
                    <p className="mt-2 text-center text-sm text-red-400">{error}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-white/5"
    >
      <span className="flex w-8 shrink-0 justify-center">{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}

export function CreateUploadFlow() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <CreateUploadFlowInner />
    </Suspense>
  );
}
