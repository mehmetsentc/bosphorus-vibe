"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { clientApiUrl } from "@/lib/client-api-url";
import {
  createImagePost,
  createVideoPost,
  uploadImagePost,
  uploadVideoPost,
  uploadVideoCoverForPost,
} from "@/lib/services/firestore";
import { useDraftUpload } from "@/lib/hooks/useDraftUpload";
import { UploadEditScreen } from "@/components/upload/UploadEditScreen";
import { UploadShareScreen } from "@/components/upload/UploadShareScreen";
import { UploadModeSwitcher } from "@/components/upload/UploadModeSwitcher";
import {
  createStory,
  uploadStoryImage,
  uploadStoryVideo,
} from "@/lib/services/stories";
import { isVideoFile, validateMediaSize, ensureVideoCoverBlob } from "@/lib/utils/media-compress";
import {
  invalidateFeedCaches,
  markReelsRefreshPending,
} from "@/lib/utils/invalidate-feed-cache";
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
const STORY_MAX_IMAGE_MB = 20;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** AI editörü arka planda tetikler — hata olsa bile upload'ı etkilemez */
async function triggerAiCaption(payload: {
  postId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userRole: string;
  userName: string;
  userCaption: string;
  location?: string;
  language: "tr" | "en";
}): Promise<void> {
  try {
    await fetch(clientApiUrl("/api/ai/caption"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Sessizce fail et — kullanıcı deneyimini etkilemesin
    console.warn("[AI Caption] background trigger failed:", err);
  }
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
  const editVideoRef = useRef<HTMLVideoElement>(null);

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
  const [sticker, setSticker] = useState<string | null>(null);
  const [showStickerTool, setShowStickerTool] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [draftMsg, setDraftMsg] = useState("");
  const coverBlobRef = useRef<Blob | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [draftUploadEnabled, setDraftUploadEnabled] = useState(false);

  // Defer background upload so the edit-screen video can decode first (iOS).
  const draft = useDraftUpload(file, user?.uid, {
    enabled: Boolean(file && user && kind && draftUploadEnabled),
    mode: kind === "story" ? "story" : "post",
    thumbnailRef: coverBlobRef,
  });

  useEffect(() => {
    if (!file || !isVideoFile(file)) return;
    let cancelled = false;
    void ensureVideoCoverBlob(file, coverBlobRef.current).then((blob) => {
      if (!cancelled && !coverBlobRef.current) coverBlobRef.current = blob;
    });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const [storyCategory, setStoryCategory] = useState<StoryCategory>(initialStoryCategory);
  const [taggedPeople, setTaggedPeople] = useState<PostTag[]>([]);
  const [location, setLocation] = useState<string | null>(null);

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

  const recentUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      recentUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      recentUrlsRef.current.clear();
    };
  }, []);

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
      recentUrlsRef.current.add(url);
      coverBlobRef.current = null;
      setCoverPreview(null);
      setDraftUploadEnabled(false);
      setTextOverlay("");
      setShowTextTool(false);
      setSticker(null);
      setShowStickerTool(false);
      setFile(next);
      setPreview(url);
      setStep("edit");

      setRecentItems((prev) => {
        const filtered = prev.filter((p) => p.file.name !== next.name);
        return [{ file: next, url, isVideo }, ...filtered].slice(0, 20);
      });
    },
    [kind, locale, t],
  );

  function selectKind(next: UploadKind) {
    setKind(next);
    setStep("gallery");
    setError("");
    setTaggedPeople([]);
    setLocation(null);
  }

  function goToShareStep() {
    setStep("share");
    window.setTimeout(() => setDraftUploadEnabled(true), 2000);
  }

  const handleDurationKnown = useCallback(
    (seconds: number) => {
      if (!preview) return;
      const duration = formatDuration(seconds);
      setRecentItems((prev) =>
        prev.map((item) =>
          item.url === preview ? { ...item, duration } : item,
        ),
      );
    },
    [preview],
  );

  function closeFlow() {
    router.push("/home");
  }

  async function resolveDraftOrUpload(): Promise<{
    isVideo: boolean;
    originalUrl: string;
    previewUrl?: string;
    lowUrl: string;
    thumbnailUrl?: string;
    photoUrl?: string;
  }> {
    if (!file || !user) throw new Error("Missing file or user");

    try {
      return await draft.waitUntilReady();
    } catch {
      if (kind === "story") {
        const isVideo = isVideoFile(file);
        if (isVideo) {
          const { originalUrl, lowUrl, thumbnailUrl } = await uploadStoryVideo(
            file,
            user.uid,
            setProgress,
          );
          return {
            isVideo: true,
            originalUrl,
            lowUrl,
            thumbnailUrl,
            photoUrl: thumbnailUrl,
          };
        }
        const photoUrl = await uploadStoryImage(file, user.uid, setProgress);
        return { isVideo: false, originalUrl: photoUrl, lowUrl: photoUrl, photoUrl };
      }

      if (kind === "reel" || isVideoFile(file)) {
        const result = await uploadVideoPost(file, user.uid, setProgress);
        return { isVideo: true, ...result };
      }
      const result = await uploadImagePost(file, user.uid, setProgress);
      return { isVideo: false, ...result };
    }
  }

  async function handlePublish() {
    if (!file || !user || !kind) return;
    setUploading(true);
    setError("");
    setProgress(0);

    const fullCaption = [textOverlay, sticker, caption].filter(Boolean).join("\n").trim();

    try {
      if (file && isVideoFile(file)) {
        try {
          coverBlobRef.current = await ensureVideoCoverBlob(file, coverBlobRef.current);
        } catch (thumbErr) {
          // Frame extraction failed (e.g. iOS canvas.toBlob returned null).
          // Keep whatever cover we already have (or null). Draft already has thumb.jpg.
          console.error("[CreateUpload] ensureVideoCoverBlob failed:", thumbErr);
        }
      }

      const media = await resolveDraftOrUpload();
      setProgress(95);

      let thumbnailUrl = media.thumbnailUrl;
      if (media.isVideo && coverBlobRef.current) {
        try {
          thumbnailUrl = await uploadVideoCoverForPost(
            media.originalUrl,
            coverBlobRef.current,
          );
        } catch (coverErr) {
          // Cover re-upload failed — draft already saved thumb.jpg, so fall back to it.
          console.error("[CreateUpload] cover upload failed, using draft thumbnail:", coverErr);
          thumbnailUrl = media.thumbnailUrl ?? thumbnailUrl;
        }
      }

      if (kind === "story") {
        await createStory({
          userId: user.uid,
          photoUrl: thumbnailUrl ?? media.photoUrl ?? media.lowUrl,
          videoOriginalUrl: media.isVideo ? media.originalUrl : undefined,
          videoLowUrl: media.isVideo ? media.lowUrl : undefined,
          storyCategory,
          description: fullCaption,
          tags: taggedPeople,
        });
        router.push("/home");
        return;
      }

      let postId: string;
      if (kind === "reel" || media.isVideo) {
        postId = await createVideoPost(
          media.originalUrl,
          media.lowUrl,
          thumbnailUrl ?? "",
          fullCaption,
          user.uid,
          taggedPeople,
          location ?? undefined,
          media.previewUrl,
        );
      } else {
        postId = await createImagePost(
          media.originalUrl,
          media.lowUrl,
          fullCaption,
          user.uid,
          taggedPeople,
          location ?? undefined,
        );
      }

      // AI editör — arka planda çalışır, kullanıcıyı bekletmez
      void triggerAiCaption({
        postId,
        mediaUrl: media.isVideo ? (thumbnailUrl ?? media.lowUrl) : media.lowUrl,
        mediaType: media.isVideo ? "video" : "image",
        userRole: profile?.role ?? "",
        userName: user.displayName ?? user.email ?? "Misafir",
        userCaption: fullCaption,
        location: location ?? undefined,
        language: locale === "en" ? "en" : "tr",
      });

      invalidateFeedCaches();
      if (kind === "reel") markReelsRefreshPending();
      router.push(kind === "reel" ? "/reels" : "/home");
    } catch (err) {
      console.error("[CreateUpload]", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  function saveDraft() {
    setDraftMsg(t("draftSaved"));
    setTimeout(() => setDraftMsg(""), 2500);
    setStep("gallery");
  }

  const shareTitle =
    kind === "reel"
      ? t("newReelVideo")
      : kind === "story"
        ? t("addToStory")
        : t("createNewPost");

  return (
    <div className="flex h-full min-h-[100dvh] flex-col bg-black text-white">
      {draftMsg && step === "gallery" && (
        <div className="fixed left-4 right-4 top-[max(3.5rem,env(safe-area-inset-top))] z-50 rounded-xl bg-white/10 px-4 py-2 text-center text-sm text-white backdrop-blur-md">
          {draftMsg}
        </div>
      )}

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
                      coverBlobRef.current = null;
                      setCoverPreview(null);
                      setDraftUploadEnabled(false);
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

            {kind && (
              <UploadModeSwitcher
                active={kind}
                onChange={(next) => {
                  setKind(next);
                  setError("");
                }}
              />
            )}

            {error && (
              <p className="px-4 pb-4 text-center text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        )}

        {(step === "edit" || step === "share") && preview && file && kind && (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full min-h-[100dvh] w-full"
          >
            {step === "edit" && (
              <UploadEditScreen
                file={file}
                preview={preview}
                poster={coverPreview}
                isVideo={isVideoFile(file)}
                textOverlay={textOverlay}
                showTextTool={showTextTool}
                sticker={sticker}
                onStickerChange={setSticker}
                showStickerTool={showStickerTool}
                draftStatus={draft.status}
                draftProgress={draft.progress}
                videoRef={editVideoRef}
                onClose={() => setStep("gallery")}
                onNext={() => goToShareStep()}
                onDurationKnown={handleDurationKnown}
                onToggleTextTool={() => {
                  setShowTextTool((v) => {
                    const next = !v;
                    if (next) setShowStickerTool(false);
                    return next;
                  });
                }}
                onToggleStickerTool={() => {
                  setShowStickerTool((v) => {
                    const next = !v;
                    if (next) setShowTextTool(false);
                    return next;
                  });
                }}
                onTextOverlayChange={setTextOverlay}
              />
            )}

            {step === "share" && (
              <UploadShareScreen
                kind={kind}
                title={shareTitle}
                preview={preview}
                coverPreview={coverPreview}
                isVideo={isVideoFile(file)}
                file={file}
                caption={caption}
                onCaptionChange={setCaption}
                taggedPeople={taggedPeople}
                onTaggedPeopleChange={setTaggedPeople}
                location={location}
                onLocationChange={setLocation}
                onCoverChange={(blob) => {
                  coverBlobRef.current = blob;
                  const url = URL.createObjectURL(blob);
                  setCoverPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                  });
                }}
                storyCategory={storyCategory}
                onStoryCategoryChange={setStoryCategory}
                storyCategoryLabels={storyCategoryLabels}
                draftStatus={draft.status}
                draftProgress={draft.progress}
                uploading={uploading}
                uploadProgress={progress}
                error={error}
                onBack={() => setStep("edit")}
                onSaveDraft={saveDraft}
                onPublish={handlePublish}
              />
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
