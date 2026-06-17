"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@/lib/utils/media-compress";
import {
  invalidateFeedCaches,
  markReelsRefreshPending,
} from "@/lib/utils/invalidate-feed-cache";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { TagPeoplePicker } from "@/components/tags/TagPeoplePicker";
import type { EventDoc, PostTag } from "@/types";

type ActivityUploadModalProps = {
  open: boolean;
  event: EventDoc | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function ActivityUploadModal({
  open,
  event,
  onClose,
  onSuccess,
}: ActivityUploadModalProps) {
  const { user, refreshProfile } = useAuth();
  const { locale } = useI18n();
  const t = useT();
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
    if (!file || !open) {
      setDraftEnabled(false);
      return;
    }
    const timer = window.setTimeout(() => setDraftEnabled(true), 400);
    return () => window.clearTimeout(timer);
  }, [file, open]);

  const draft = useDraftUpload(file, user?.uid, {
    enabled: open && draftEnabled && Boolean(file),
    thumbnailRef: coverBlobRef,
  });

  useEffect(() => {
    if (!open || !event) return;
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
            skipClientPreview: true,
          });
          media = { isVideo: true, ...result };
        } else {
          const result = await uploadImagePost(file, user.uid, setProgress);
          media = { isVideo: false, ...result };
        }
      }

      let thumbUrl = media.thumbnailUrl;
      if (media.isVideo && coverBlobRef.current) {
        thumbUrl = await uploadVideoCoverForPost(
          media.originalUrl,
          coverBlobRef.current,
        );
      }

      const urls = {
        originalUrl: media.originalUrl,
        lowUrl: media.lowUrl,
        thumbUrl: media.isVideo ? thumbUrl ?? media.thumbnailUrl : media.lowUrl,
      };

      setProgress(95);
      await createActivityPostFromMedia(urls, meta);

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
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-border bg-surface-card p-6 pb-10"
          >
            <h2 className="font-display text-xl font-bold">{t("uploadActivity")}</h2>
            <p className="mt-1 text-sm text-muted">{t("uploadActivityDesc")}</p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 transition hover:border-vibe/40">
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  setPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return next ? URL.createObjectURL(next) : null;
                  });
                  coverBlobRef.current = null;
                  setFile(next);
                  setError("");
                }}
              />
              {file ? (
                <span className="px-4 text-center text-sm text-vibe">{file.name}</span>
              ) : (
                <span className="text-sm text-muted">{t("selectMedia")}</span>
              )}
            </label>

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
                  className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-vibe/50"
                />
              </Field>

              <Field label={t("location")}>
                <input
                  type="text"
                  value={locating ? t("locationFetching") : location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-vibe/50"
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
                  className="w-full rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-vibe/50"
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
