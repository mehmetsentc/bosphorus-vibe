"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/components/providers/I18nProvider";
import {
  createStoryHighlight,
  deleteStoryHighlight,
  updateStoryHighlight,
  uploadHighlightCover,
} from "@/lib/services/story-highlights";
import {
  getAllStoriesByUser,
  storyCoverUrl,
} from "@/lib/services/stories";
import type { StoryDoc, StoryHighlightDoc } from "@/types";

type HighlightEditorModalProps = {
  open: boolean;
  userId: string;
  editHighlight?: StoryHighlightDoc | null;
  onClose: () => void;
  onSaved: () => void;
};

export function HighlightEditorModal({
  open,
  userId,
  editHighlight,
  onClose,
  onSaved,
}: HighlightEditorModalProps) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archive, setArchive] = useState<StoryDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setTitle(editHighlight?.title ?? "");
    setCoverUrl(editHighlight?.coverUrl ?? "");
    setSelectedIds(editHighlight?.storyIds ?? []);
    setError("");
  }, [open, editHighlight]);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    getAllStoriesByUser(userId)
      .then(setArchive)
      .finally(() => setLoading(false));
  }, [open, userId]);

  const toggleStory = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (!coverUrl && next.length) {
        const story = archive.find((s) => s.id === next[0]);
        if (story) setCoverUrl(storyCoverUrl(story));
      }
      return next;
    });
  }, [archive, coverUrl]);

  async function handleCoverUpload(file: File) {
    setSaving(true);
    setError("");
    try {
      const url = await uploadHighlightCover(file, userId);
      setCoverUrl(url);
    } catch {
      setError(t("highlightSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError(t("highlightTitleRequired"));
      return;
    }
    if (!selectedIds.length) {
      setError(t("highlightStoriesRequired"));
      return;
    }
    const cover = coverUrl || storyCoverUrl(archive.find((s) => s.id === selectedIds[0])!);
    if (!cover) {
      setError(t("highlightCoverRequired"));
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editHighlight) {
        await updateStoryHighlight(editHighlight.id, userId, {
          title: title.trim(),
          coverUrl: cover,
          storyIds: selectedIds,
        });
      } else {
        await createStoryHighlight({
          userId,
          title: title.trim(),
          coverUrl: cover,
          storyIds: selectedIds,
        });
      }
      onSaved();
      onClose();
    } catch {
      setError(t("highlightSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editHighlight) return;
    if (!window.confirm(t("highlightDeleteConfirm"))) return;
    setSaving(true);
    try {
      await deleteStoryHighlight(editHighlight.id, userId);
      onSaved();
      onClose();
    } catch {
      setError(t("highlightSaveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-background p-4 sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-center font-display text-base font-semibold">
            {editHighlight ? t("highlightEdit") : t("highlightNew")}
          </h2>

          <div className="mb-4 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-vibe/50 bg-surface-overlay"
            >
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-muted">
                  {t("highlightCover")}
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCoverUpload(file);
              }}
            />
            <p className="text-center text-xs text-muted">{t("highlightCoverHint")}</p>
          </div>

          <label className="mb-1 block text-xs font-semibold text-muted">
            {t("highlightTitle")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={32}
            placeholder={t("highlightTitlePlaceholder")}
            className="mb-4 w-full rounded-xl border border-border bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-vibe"
          />

          <p className="mb-2 text-xs font-semibold text-muted">{t("highlightPickStories")}</p>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted">{t("loading")}</p>
          ) : archive.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("highlightNoArchive")}</p>
          ) : (
            <div className="mb-4 grid grid-cols-3 gap-1.5">
              {archive.map((story) => {
                const selected = selectedIds.includes(story.id);
                const thumb = storyCoverUrl(story);
                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => toggleStory(story.id)}
                    className={`relative aspect-[9/16] overflow-hidden rounded-lg bg-black ${
                      selected ? "ring-2 ring-vibe" : "opacity-80"
                    }`}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : null}
                    {selected && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-vibe text-xs font-bold text-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {error && <p className="mb-3 text-center text-sm text-red-400">{error}</p>}

          <div className="flex gap-2">
            {editHighlight && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving}
                className="flex-1 rounded-xl border border-red-500/40 py-3 text-sm font-semibold text-red-400"
              >
                {t("highlightDelete")}
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 rounded-xl bg-vibe py-3 text-sm font-semibold text-black disabled:opacity-60"
            >
              {saving ? "…" : t("save")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
