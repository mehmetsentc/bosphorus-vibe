"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadVideoPost, createVideoPost } from "@/lib/services/firestore";
import { isVideoFile, validateMediaSize } from "@/lib/utils/media-compress";
import {
  invalidateFeedCaches,
  markReelsRefreshPending,
} from "@/lib/utils/invalidate-feed-cache";
import { useI18n } from "@/components/providers/I18nProvider";
import { TagPeoplePicker } from "@/components/tags/TagPeoplePicker";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import type { PostTag } from "@/types";

export function VideoUploadModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const t = useT();
  const { locale } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<PostTag[]>([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file || !user) return;
    if (!isVideoFile(file)) {
      setError(t("replaceVideoOnly"));
      return;
    }
    const sizeError = validateMediaSize(file, locale);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { originalUrl, lowUrl, thumbnailUrl } = await uploadVideoPost(
        file,
        user.uid,
        setProgress,
      );
      await createVideoPost(originalUrl, lowUrl, thumbnailUrl, caption, user.uid, taggedPeople);
      invalidateFeedCaches();
      markReelsRefreshPending();
      setFile(null);
      setCaption("");
      setTaggedPeople([]);
      setProgress(0);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[VideoUpload]", err);
      setError(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-lg md:max-w-xl rounded-t-3xl bg-[#1a1a1a] p-6 pb-10"
          >
            <h2 className="font-display text-xl font-bold">{t("uploadReelTitle")}</h2>
            <p className="mt-1 text-sm text-white/50">{t("uploadReelDesc")}</p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 py-8 transition hover:border-gold/40">
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span className="text-sm text-gold">{file.name}</span>
              ) : (
                <span className="text-sm text-white/40">{t("selectVideo")}</span>
              )}
            </label>

            <input
              type="text"
              placeholder={t("writeCaption")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-4 w-full rounded-xl border border-white/10 bg-[#242424] px-4 py-3 text-sm outline-none focus:border-gold/50"
            />

            <TagPeoplePicker
              value={taggedPeople}
              onChange={setTaggedPeople}
              className="mt-4"
              variant="dark"
            />

            {uploading && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-[#242424]">
                  <motion.div
                    className="h-full gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-white/40">{progress}%</p>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleUpload}
              className="mt-4 w-full rounded-xl gold-gradient py-3 text-sm font-bold text-black disabled:opacity-40"
            >
              {uploading ? t("uploading") : t("shareAction")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
