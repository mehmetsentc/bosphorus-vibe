"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  deleteUserPost,
  getPostCaption,
  getPostImageUrl,
  getPostVideoUrl,
  replaceUserPostImage,
  replaceUserPostVideo,
  updateUserPostCaption,
} from "@/lib/services/firestore";
import { validateMediaSize } from "@/lib/utils/media-compress";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

type PostManageModalProps = {
  post: UserPostDoc | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted?: () => void;
};

type Step = "menu" | "caption" | "media" | "delete";

export function PostManageModal({
  post,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: PostManageModalProps) {
  const { user } = useAuth();
  const t = useT();
  const { locale } = useI18n();
  const [step, setStep] = useState<Step>("menu");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isVideo = post ? Boolean(getPostVideoUrl(post)) : false;

  useEffect(() => {
    if (!open || !post) return;
    setStep("menu");
    setCaption(getPostCaption(post));
    setFile(null);
    setProgress(0);
    setError("");
  }, [open, post]);

  function closeAll() {
    if (busy) return;
    onClose();
  }

  async function handleSaveCaption() {
    if (!post || !user) return;
    setBusy(true);
    setError("");
    try {
      await updateUserPostCaption(post.id, user.uid, caption.trim());
      onUpdated();
      closeAll();
    } catch {
      setError(t("postUpdateFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleReplaceMedia() {
    if (!post || !user || !file) return;
    const validationError = validateMediaSize(file, locale);
    if (validationError) {
      setError(validationError);
      return;
    }
    const fileIsVideo = file.type.startsWith("video/");
    if (isVideo && !fileIsVideo) {
      setError(t("replaceVideoOnly"));
      return;
    }
    if (!isVideo && !file.type.startsWith("image/")) {
      setError(t("replaceImageOnly"));
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (fileIsVideo) {
        await replaceUserPostVideo(post.id, user.uid, file, setProgress);
      } else {
        await replaceUserPostImage(post.id, user.uid, file, setProgress);
      }
      onUpdated();
      closeAll();
    } catch {
      setError(t("postUpdateFailed"));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  async function handleDelete() {
    if (!post || !user) return;
    setBusy(true);
    setError("");
    try {
      await deleteUserPost(post.id, user.uid);
      onUpdated();
      onDeleted?.();
      closeAll();
    } catch {
      setError(t("postDeleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeAll}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl border border-white/10 bg-surface-card p-6 pb-10"
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />

            {step === "menu" && (
              <>
                <h2 className="font-display text-lg font-semibold">{t("managePost")}</h2>
                <p className="mt-1 text-sm text-muted">{t("managePostDesc")}</p>
                <div className="mt-5 space-y-2">
                  <MenuButton onClick={() => setStep("caption")}>{t("editCaption")}</MenuButton>
                  <MenuButton onClick={() => setStep("media")}>
                    {isVideo ? t("replaceVideo") : t("replaceImage")}
                  </MenuButton>
                  <MenuButton danger onClick={() => setStep("delete")}>
                    {t("deletePost")}
                  </MenuButton>
                </div>
              </>
            )}

            {step === "caption" && (
              <>
                <h2 className="font-display text-lg font-semibold">{t("editCaption")}</h2>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="mt-4 w-full resize-none rounded-xl border border-border bg-surface-overlay px-4 py-3 text-sm outline-none focus:border-gold/50"
                />
                <ActionRow
                  primaryLabel={t("saveChanges")}
                  secondaryLabel={t("back")}
                  onPrimary={handleSaveCaption}
                  onSecondary={() => setStep("menu")}
                  busy={busy}
                />
              </>
            )}

            {step === "media" && (
              <>
                <h2 className="font-display text-lg font-semibold">
                  {isVideo ? t("replaceVideo") : t("replaceImage")}
                </h2>
                <p className="mt-1 text-sm text-muted">{t("replaceMediaDesc")}</p>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 transition hover:border-gold/40">
                  <input
                    type="file"
                    accept={isVideo ? "video/*" : "image/*"}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <span className="text-sm text-gold">{file.name}</span>
                  ) : (
                    <span className="text-sm text-muted">
                      {isVideo ? t("selectVideo") : t("selectMedia")}
                    </span>
                  )}
                </label>
                {busy && progress > 0 && (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        className="h-full bg-gold transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-center text-xs text-muted">{progress}%</p>
                  </div>
                )}
                <ActionRow
                  primaryLabel={t("saveChanges")}
                  secondaryLabel={t("back")}
                  onPrimary={handleReplaceMedia}
                  onSecondary={() => setStep("menu")}
                  busy={busy}
                  primaryDisabled={!file}
                />
              </>
            )}

            {step === "delete" && (
              <>
                <h2 className="font-display text-lg font-semibold text-red-400">
                  {t("deletePostConfirm")}
                </h2>
                <p className="mt-2 text-sm text-muted">{t("deletePostDesc")}</p>
                <ActionRow
                  primaryLabel={t("deletePost")}
                  secondaryLabel={t("back")}
                  onPrimary={handleDelete}
                  onSecondary={() => setStep("menu")}
                  busy={busy}
                  danger
                />
              </>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {step === "menu" && (
              <button
                type="button"
                onClick={closeAll}
                className="mt-4 w-full rounded-xl border border-border py-3 text-sm text-muted transition hover:text-foreground"
              >
                {t("close")}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.99] ${
        danger
          ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
          : "bg-surface-overlay hover:bg-surface-card"
      }`}
    >
      {children}
    </button>
  );
}

function ActionRow({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  busy,
  primaryDisabled,
  danger,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  busy?: boolean;
  primaryDisabled?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="mt-5 flex gap-2">
      <button
        type="button"
        onClick={onSecondary}
        disabled={busy}
        className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
      >
        {secondaryLabel}
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={busy || primaryDisabled}
        className={`flex-1 rounded-xl py-3 text-sm font-semibold text-black transition disabled:opacity-50 ${
          danger ? "bg-red-500 text-white" : "bg-gold hover:brightness-110"
        }`}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
