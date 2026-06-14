"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import {
  buildShareUrl,
  copyShareLink,
  nativeShare,
  type ExternalSharePlatform,
} from "@/lib/utils/share-links";
import { BRAND_NAME } from "@/lib/brand";

const StoryPostComposer = dynamic(
  () =>
    import("@/components/stories/StoryPostComposer").then((m) => ({
      default: m.StoryPostComposer,
    })),
  { ssr: false },
);

export type SharePayload = {
  url: string;
  title?: string;
  text?: string;
  thumbnail?: string;
  postId?: string;
};

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  payload: SharePayload | null;
  onToast?: (message: string) => void;
};

type PlatformAction = {
  id: ExternalSharePlatform | "copy" | "more";
  label: string;
  emoji: string;
  bg: string;
};

export function ShareSheet({ open, onClose, payload, onToast }: ShareSheetProps) {
  const t = useT();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const { prefs } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);

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

  const toast = useCallback(
    (message: string) => {
      onToast?.(message);
    },
    [onToast],
  );

  const shareText = payload?.text || payload?.title || BRAND_NAME;
  const shareTitle = payload?.title || BRAND_NAME;

  function handleStoryShare() {
    if (!payload?.postId) return;
    if (!canUpload) {
      router.push("/welcome?reason=auth-required");
      onClose();
      return;
    }
    if (!user) return;
    onClose();
    setStoryComposerOpen(true);
  }

  function openExternal(platform: ExternalSharePlatform) {
    if (!payload) return;
    window.open(buildShareUrl(platform, payload.url, shareText), "_blank", "noopener,noreferrer");
    onClose();
  }

  async function handleCopy() {
    if (!payload) return;
    await copyShareLink(payload.url);
    toast(t("linkCopied"));
    onClose();
  }

  async function handleMore() {
    if (!payload) return;
    const shared = await nativeShare({
      title: shareTitle,
      text: shareText,
      url: payload.url,
    });
    if (!shared) {
      await copyShareLink(payload.url);
      toast(t("linkCopied"));
    }
    onClose();
  }

  const platforms: PlatformAction[] = [
    { id: "whatsapp", label: "WhatsApp", emoji: "💬", bg: "bg-[#25D366]/20" },
    { id: "telegram", label: "Telegram", emoji: "✈️", bg: "bg-[#229ED9]/20" },
    { id: "twitter", label: "X", emoji: "𝕏", bg: "bg-white/10" },
    { id: "facebook", label: "Facebook", emoji: "f", bg: "bg-[#1877F2]/20" },
    { id: "copy", label: t("shareCopyLink"), emoji: "🔗", bg: "bg-surface-overlay" },
    { id: "more", label: t("shareMore"), emoji: "↗", bg: "bg-surface-overlay" },
  ];

  const userPhoto = profile?.photo_url || user?.photoURL || "";
  const canShareToStory = Boolean(payload?.postId && prefs.allowSharing);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && payload && (
        <div className="fixed inset-0 z-[135] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label={t("close")}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-sheet-title"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[28px] border border-white/10 bg-surface-card/95 shadow-2xl backdrop-blur-xl sm:rounded-[28px]"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />

            <div className="flex items-center gap-3 border-b border-border/80 px-5 py-4">
              {payload.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={payload.thumbnail}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-overlay text-xl">
                  🧭
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p id="share-sheet-title" className="truncate font-semibold">
                  {shareTitle}
                </p>
                <p className="truncate text-xs text-muted">{payload.url}</p>
              </div>
            </div>

            {canShareToStory && (
              <div className="border-b border-border/80 px-5 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                  {t("shareSheetStorySection")}
                </p>
                <button
                  type="button"
                  onClick={handleStoryShare}
                  className="flex w-full items-center gap-3 rounded-2xl border border-vibe/30 bg-vibe/10 px-4 py-3 transition hover:bg-vibe/15"
                >
                  <div className="rounded-full bg-gradient-to-br from-gold via-vibe to-gold p-[2px]">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-black">
                      {userPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userPhoto}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">+</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-semibold">{t("shareStory")}</p>
                    <p className="text-xs text-muted">{t("storyExpiresHint")}</p>
                  </div>
                </button>
              </div>
            )}

            <div className="px-5 py-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                {t("shareSheetAppsSection")}
              </p>
              <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {platforms.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "copy") void handleCopy();
                      else if (item.id === "more") void handleMore();
                      else openExternal(item.id);
                    }}
                    className="flex w-[72px] shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl ${item.bg} ring-1 ring-border/60`}
                    >
                      {item.emoji}
                    </span>
                    <span className="max-w-[72px] truncate text-[11px] text-foreground/90">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border/80 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-muted transition hover:bg-surface-overlay hover:text-foreground"
              >
                {t("close")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <StoryPostComposer
        open={storyComposerOpen}
        postId={payload?.postId ?? null}
        onClose={() => setStoryComposerOpen(false)}
        onToast={toast}
      />
    </AnimatePresence>,
    document.body,
  );
}
