"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  addPostComment,
  getPostComments,
} from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { containsHiddenWord } from "@/lib/settings/preferences";
import { useRouter } from "next/navigation";
import type { PostCommentDoc } from "@/types";

type PostCommentModalProps = {
  postId: string;
  open: boolean;
  onClose: () => void;
  onCommentAdded?: (count: number) => void;
  initialCount?: number;
};

export function PostCommentModal({
  postId,
  open,
  onClose,
  onCommentAdded,
  initialCount = 0,
}: PostCommentModalProps) {
  const { user } = useAuth();
  const { canComment } = useAccess();
  const router = useRouter();
  const t = useT();
  const { dateLocale } = useI18n();
  const { prefs } = useSettings();
  const [comments, setComments] = useState<PostCommentDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      setComments(await getPostComments(postId));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!open) return;
    setText("");
    setError("");
    loadComments();
  }, [open, loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canComment) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (prefs.allowComments === "off") {
      setError(t("commentsDisabled"));
      return;
    }
    if (containsHiddenWord(text, prefs.hiddenWords)) {
      setError(t("commentBlockedWord"));
      return;
    }
    if (!user || !text.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await addPostComment(postId, user.uid, text);
      setText("");
      const updated = await getPostComments(postId);
      setComments(updated);
      onCommentAdded?.(updated.length);
    } catch {
      setError(t("commentFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="comments-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative z-10 flex max-h-[min(85dvh,100%)] w-full max-w-lg flex-col rounded-t-3xl border border-white/10 bg-surface-card shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-border" />
            <h2
              id="comments-title"
              className="shrink-0 border-b border-border px-5 py-4 text-center font-display text-base font-semibold"
            >
              {t("comments")}
            </h2>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : comments.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  {t("noCommentsYet")}
                </p>
              ) : (
                <ul className="space-y-4">
                  {comments
                    .filter(
                      (item) =>
                        !containsHiddenWord(item.comment, prefs.hiddenWords),
                    )
                    .map((item) => (
                    <li key={item.id} className="flex gap-3">
                      {item.userPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.userPhoto}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-sm text-gold">
                          {(item.userName ?? "?")[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {item.userName ?? t("user")}
                          </span>{" "}
                          <span className="text-foreground/90">{item.comment}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {item.timePosted.toLocaleString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-border bg-surface-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("addCommentPlaceholder")}
                  disabled={!canComment || submitting || prefs.allowComments === "off"}
                  className="flex-1 rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-gold/50 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || submitting || !canComment || prefs.allowComments === "off"}
                  className="shrink-0 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
                >
                  {submitting ? "…" : t("postComment")}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
