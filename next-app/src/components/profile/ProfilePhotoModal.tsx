"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cropImageToSquare } from "@/lib/utils/crop-image";
import { updateUserPhoto } from "@/lib/services/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";

export type ProfilePhotoModalHandle = {
  openPicker: () => void;
};

type ProfilePhotoModalProps = {
  onSuccess?: () => void;
};

export const ProfilePhotoModal = forwardRef<
  ProfilePhotoModalHandle,
  ProfilePhotoModalProps
>(function ProfilePhotoModal({ onSuccess }, ref) {
  const { user, refreshProfile } = useAuth();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useImperativeHandle(ref, () => ({
    openPicker: () => {
      setError("");
      inputRef.current?.click();
    },
  }));

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCroppedBlob(null);
    setError("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    setBusy(true);
    setError("");
    try {
      const blob = await cropImageToSquare(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setCroppedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setError(t("profilePhotoFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!user || !croppedBlob) return;
    setBusy(true);
    setError("");
    try {
      await updateUserPhoto(user.uid, croppedBlob);
      await refreshProfile();
      onSuccess?.();
      closePreview();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("profilePhotoFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
            onClick={closePreview}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-3xl border border-border bg-surface-card p-6 pb-8 sm:rounded-3xl"
            >
              <h2 className="text-center text-lg font-semibold">
                {t("changeProfilePhoto")}
              </h2>
              <p className="mt-1 text-center text-sm text-muted">
                {t("profilePhotoCropHint")}
              </p>

              <div className="mx-auto mt-6 flex justify-center">
                <div className="rounded-full ring-2 ring-vibe/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-48 w-48 rounded-full object-cover"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-red-400">{error}</p>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={closePreview}
                  className="flex-1 rounded-xl bg-surface-overlay py-3 text-sm font-semibold"
                >
                  {t("close")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSave}
                  className="flex-1 rounded-xl gold-gradient py-3 text-sm font-bold text-black disabled:opacity-50"
                >
                  {busy ? t("uploading") : t("savePhoto")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {busy && !previewUrl && (
        <div className="fixed inset-0 z-[109] flex items-center justify-center bg-black/40">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
        </div>
      )}
    </>
  );
});
