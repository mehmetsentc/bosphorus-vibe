"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  createActivityPostFromMedia,
  uploadImagePost,
  uploadVideoCoverForPost,
  uploadVideoPost,
} from "@/lib/services/firestore";
import { useDraftUpload } from "@/lib/hooks/useDraftUpload";
import { VideoCoverPicker } from "@/components/upload/VideoCoverPicker";
import { getCurrentLocationLabel } from "@/lib/utils/geolocation";
import {
  isVideoFile,
  validateMediaSize,
  ensureVideoCoverBlob,
} from "@/lib/utils/media-compress";
import {
  invalidateFeedCaches,
  markReelsRefreshPending,
} from "@/lib/utils/invalidate-feed-cache";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { clientApiUrl } from "@/lib/client-api-url";
import { TagPeoplePicker } from "@/components/tags/TagPeoplePicker";
import type { EventDoc, PostTag } from "@/types";

/** Arka planda AI caption tetikler — hata olsa da upload'ı etkilemez */
async function triggerAiCaption(payload: {
  postId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userRole: string;
  userName: string;
  userCaption: string;
  participantCount?: number;
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
    console.warn("[AI Caption] activity trigger failed:", err);
  }
}

type ActivityUploadModalProps = {
  open: boolean;
  event: EventDoc | null;
  onClose: () => void;
  onSuccess: () => void;
};

type Step = "gallery" | "details";

type RecentItem = {
  file: File;
  url: string;
  isVideo: boolean;
};

export function ActivityUploadModal({
  open,
  event,
  onClose,
  onSuccess,
}: ActivityUploadModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recentUrlsRef = useRef<Set<string>>(new Set());

  const [step, setStep] = useState<Step>("gallery");
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activityName, setActivityName] = useState("");
  const [location, setLocation] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [locating, setLocating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<PostTag[]>([]);
  const coverBlobRef = useRef<Blob | null>(null);
  const [draftEnabled, setDraftEnabled] = useState(false);

  useEffect(() => {
    return () => {
      recentUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      recentUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!file || !open || step !== "details") {
      setDraftEnabled(false);
      return;
    }
    const timer = window.setTimeout(() => setDraftEnabled(true), 2500);
    return () => window.clearTimeout(timer);
  }, [file, open, step]);

  const draft = useDraftUpload(file, user?.uid, {
    enabled: open && draftEnabled && Boolean(file),
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

  const handleFile = useCallback(
    (next: File | null) => {
      setError("");
      if (!next) return;

      const sizeError = validateMediaSize(next, locale);
      if (sizeError) {
        setError(sizeError);
        return;
      }

      const url = URL.createObjectURL(next);
      recentUrlsRef.current.add(url);
      const isVideo = isVideoFile(next);

      coverBlobRef.current = null;
      setPreviewUrl((prev) => {
        if (prev && !recentItems.some((item) => item.url === prev)) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });
      setFile(next);
      setStep("details");

      setRecentItems((prev) => {
        const filtered = prev.filter((p) => p.file.name !== next.name);
        return [{ file: next, url, isVideo }, ...filtered].slice(0, 20);
      });
    },
    [locale, recentItems],
  );

  useEffect(() => {
    if (!open || !event) return;
    setStep("gallery");
    setActivityName(event.eventName);
    setFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    coverBlobRef.current = null;
    setParticipantCount("");
    setError("");
    setProgress(0);
    setTaggedPeople([]);

    setLocating(true);
    getCurrentLocationLabel(locale)
      .then(setLocation)
      .catch(() => setLocation(event.eventLocation || t("locationUnavailable")))
      .finally(() => setLocating(false));
  }, [open, event, locale, t]);

  async function handleUpload() {
    if (!file || !user || !event) return;

    const sizeError = validateMediaSize(file, locale);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    const count = parseInt(participantCount, 10);
    if (!Number.isFinite(count) || count < 0) {
      setError(t("invalidParticipantCount"));
      return;
    }

    setUploading(true);
    setError("");
    try {
      if (isVideoFile(file)) {
        coverBlobRef.current = await ensureVideoCoverBlob(file, coverBlobRef.current);
      }

      const meta = {
        userId: user.uid,
        eventId: event.id,
        activityName: activityName.trim() || event.eventName,
        location: location.trim() || event.eventLocation,
        participantCount: count,
        isVideo: isVideoFile(file),
        tags: taggedPeople,
      };

      let media;
      try {
        media = await draft.waitUntilReady();
      } catch {
        if (isVideoFile(file)) {
          const result = await uploadVideoPost(file, user.uid, setProgress, {
            getThumbnailBlob: () => coverBlobRef.current,
          });
          media = { isVideo: true, ...result };
        } else {
          const result = await uploadImagePost(file, user.uid, setProgress);
          media = { isVideo: false, ...result };
        }
      }

      let thumbUrl = media.thumbnailUrl;
      if (media.isVideo) {
        thumbUrl = await uploadVideoCoverForPost(
          media.originalUrl,
          coverBlobRef.current!,
        );
      }

      const urls = {
        originalUrl: media.originalUrl,
        lowUrl: media.lowUrl,
        previewUrl: media.isVideo ? media.previewUrl : undefined,
        thumbUrl: media.isVideo ? thumbUrl ?? media.thumbnailUrl : media.lowUrl,
      };

      setProgress(95);
      const postId = await createActivityPostFromMedia(urls, meta);

      // AI editör — arka planda çalışır, kullanıcıyı bekletmez
      const mediaUrl = media.isVideo ? (thumbUrl ?? media.thumbnailUrl ?? urls.lowUrl) : urls.lowUrl;
      void triggerAiCaption({
        postId,
        mediaUrl,
        mediaType: media.isVideo ? "video" : "image",
        userRole: profile?.role ?? "",
        userName: user.displayName ?? user.email ?? "Misafir",
        userCaption: activityName.trim(),
        participantCount: count > 0 ? count : undefined,
        language: locale === "en" ? "en" : "tr",
      });

      invalidateFeedCaches();
      markReelsRefreshPending();
      await refreshProfile();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[ActivityUpload]", err);
      setError(t("uploadActivityFailed"));
    } finally {
      setUploading(false);
    }
  }

  const isVideo = file ? isVideoFile(file) : false;

  return (
    <AnimatePresence>
      {open && event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100] ${
            step === "gallery" ? "bg-black" : "flex items-end justify-center bg-black/70 backdrop-blur-sm"
          }`}
          onClick={step === "details" ? onClose : undefined}
        >
          {step === "gallery" ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl leading-none text-white"
                  aria-label={t("close")}
                >
                  ✕
                </button>
                <h1 className="text-base font-semibold text-white">{t("uploadActivity")}</h1>
                <span className="w-6" />
              </header>

              <div className="flex items-center justify-between px-4 py-2">
                <button type="button" className="text-sm font-semibold text-white">
                  {t("storyRecents")} ▾
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-white/70"
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
                  handleFile(e.target.files?.[0] ?? null);
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
                  handleFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />

              <div className="flex-1 overflow-y-auto px-0.5 pb-8">
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
                        setFile(item.file);
                        setPreviewUrl(item.url);
                        setStep("details");
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
                      {item.isVideo && (
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1 text-[10px] text-white">
                          ▶
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
                    <span className="px-2 text-center text-[10px]">{t("selectFromGallery")}</span>
                  </button>
                </div>
              </div>

              {error && (
                <p className="px-4 pb-4 text-center text-sm text-red-400">{error}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-border bg-surface-card p-6 pb-10"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("gallery");
                  }}
                  className="text-sm text-muted hover:text-foreground"
                >
                  ← {t("selectFromGallery")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-muted hover:text-foreground"
                  aria-label={t("close")}
                >
                  ✕
                </button>
              </div>

              <h2 className="font-display text-xl font-bold">{t("uploadActivity")}</h2>
              <p className="mt-1 text-sm text-muted">{t("uploadActivityDesc")}</p>

              {file && previewUrl && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-black/40">
                  {isVideo ? (
                    <video
                      src={previewUrl}
                      className="max-h-48 w-full object-contain"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt=""
                      className="max-h-48 w-full object-contain"
                    />
                  )}
                  <p className="truncate px-3 py-2 text-xs text-muted">{file.name}</p>
                </div>
              )}

              {draft.status === "uploading" && (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>{t("draftUploading")}</span>
                    <span>{draft.progress}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-surface-overlay">
                    <div
                      className="h-full bg-vibe transition-all"
                      style={{ width: `${draft.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {draft.status === "ready" && (
                <p className="mt-2 text-xs text-vibe">{t("draftUploadReady")}</p>
              )}

              {isVideo && file && previewUrl && (
                <VideoCoverPicker
                  file={file}
                  previewUrl={previewUrl}
                  onCoverChange={(blob) => {
                    coverBlobRef.current = blob;
                  }}
                  className="mt-4"
                />
              )}

              <div className="mt-4 space-y-3">
                <Field label={t("activityName")}>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm text-foreground outline-none focus:border-vibe/50"
                  />
                </Field>

                <Field label={t("location")}>
                  <input
                    type="text"
                    value={locating ? t("locationFetching") : location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm text-foreground outline-none focus:border-vibe/50"
                  />
                </Field>

                <Field label={t("participantCount")}>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="0"
                    value={participantCount}
                    onChange={(e) => setParticipantCount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm text-foreground outline-none focus:border-vibe/50"
                  />
                </Field>
              </div>

              <TagPeoplePicker
                value={taggedPeople}
                onChange={setTaggedPeople}
                className="mt-4"
              />

              {uploading && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                    <motion.div
                      className="h-full bg-vibe"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-muted">{progress}%</p>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

              <button
                type="button"
                disabled={!file || uploading || locating}
                onClick={handleUpload}
                className="mt-4 w-full rounded-xl gold-gradient py-3 text-sm font-bold text-black disabled:opacity-40"
              >
                {uploading ? t("uploading") : t("upload")}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
