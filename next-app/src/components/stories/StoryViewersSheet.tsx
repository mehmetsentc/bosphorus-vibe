"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserDoc } from "@/lib/services/auth";
import { useT } from "@/components/providers/I18nProvider";

export type StoryViewerProfile = {
  uid: string;
  displayName: string;
  username: string;
  photoUrl: string;
};

async function loadViewerProfiles(
  viewerIds: string[],
  excludeUid?: string,
): Promise<StoryViewerProfile[]> {
  const ids = [...viewerIds]
    .reverse()
    .filter((id) => id !== excludeUid);
  const unique = [...new Set(ids)];

  const profiles = await Promise.all(
    unique.map(async (uid) => {
      const doc = await getUserDoc(uid);
      if (!doc) return null;
      return {
        uid,
        displayName: doc.display_name || doc.userName || uid,
        username: doc.userName || doc.display_name || uid,
        photoUrl: doc.photo_url || "",
      };
    }),
  );

  return profiles.filter((p): p is StoryViewerProfile => p !== null);
}

type StoryViewersSheetProps = {
  open: boolean;
  onClose: () => void;
  viewerIds: string[];
  excludeUid?: string;
};

export function StoryViewersSheet({
  open,
  onClose,
  viewerIds,
  excludeUid,
}: StoryViewersSheetProps) {
  const t = useT();
  const [viewers, setViewers] = useState<StoryViewerProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    loadViewerProfiles(viewerIds, excludeUid).then((profiles) => {
      if (!cancelled) {
        setViewers(profiles);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, viewerIds, excludeUid]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t("close")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[151] mx-auto max-h-[70vh] max-w-[430px] overflow-hidden rounded-t-2xl bg-surface-card"
          >
            <div className="flex justify-center py-2">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <header className="border-b border-border px-4 pb-3">
              <h2 className="text-center text-base font-semibold">
                {t("storyViewersTitle")}
              </h2>
            </header>
            <div className="max-h-[calc(70vh-4.5rem)] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                </div>
              ) : viewers.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">
                  {t("storyNoViewers")}
                </p>
              ) : (
                <ul>
                  {viewers.map((viewer) => (
                    <li key={viewer.uid}>
                      <Link
                        href={`/user/${viewer.uid}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-overlay"
                      >
                        {viewer.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={viewer.photoUrl}
                            alt=""
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold">
                            {viewer.displayName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {viewer.displayName}
                          </p>
                          <p className="truncate text-xs text-muted">
                            @{viewer.username}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type StoryViewersTriggerProps = {
  viewerIds: string[];
  excludeUid?: string;
  onClick: () => void;
};

export function StoryViewersTrigger({
  viewerIds,
  excludeUid,
  onClick,
}: StoryViewersTriggerProps) {
  const t = useT();
  const [preview, setPreview] = useState<StoryViewerProfile[]>([]);

  const viewerCount = viewerIds.filter((id) => id !== excludeUid).length;

  useEffect(() => {
    let cancelled = false;
    loadViewerProfiles(viewerIds, excludeUid).then((profiles) => {
      if (!cancelled) setPreview(profiles.slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, [viewerIds, excludeUid]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1 text-left text-white transition hover:bg-white/10"
    >
      <svg
        className="h-6 w-6 shrink-0 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {preview.length > 0 && (
        <span className="flex -space-x-2">
          {preview.map((viewer) =>
            viewer.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={viewer.uid}
                src={viewer.photoUrl}
                alt=""
                className="h-6 w-6 rounded-full border-2 border-black object-cover"
              />
            ) : (
              <span
                key={viewer.uid}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white/20 text-[10px] font-bold text-white"
              >
                {viewer.displayName[0]?.toUpperCase()}
              </span>
            ),
          )}
        </span>
      )}
      <span className="truncate text-sm font-medium">
        {viewerCount > 0
          ? t("storyViewersCount").replace("{count}", String(viewerCount))
          : t("storyNoViewersYet")}
      </span>
    </button>
  );
}
