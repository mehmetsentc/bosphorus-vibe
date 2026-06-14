"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import { StoryRing } from "@/components/stories/StoryRing";
import { isCacheExpired } from "@/lib/cache/constants";
import { prefetchStoriesFeed } from "@/lib/cache/stories-prefetch";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  cleanupOwnExpiredStories,
  getActiveStories,
  groupStoriesByUser,
  storyCoverUrl,
} from "@/lib/services/stories";
import { useAppStore } from "@/store/appStore";
import type { StoryUserGroup } from "@/types";

const StoryUploadModal = dynamic(
  () => import("@/components/stories/StoryUploadModal").then((m) => ({ default: m.StoryUploadModal })),
  { ssr: false },
);

const StoryViewer = dynamic(
  () => import("@/components/stories/StoryViewer").then((m) => ({ default: m.StoryViewer })),
  { ssr: false },
);

type StoriesStripProps = {
  uploadOpen?: boolean;
  onUploadOpenChange?: (open: boolean) => void;
};

export function StoriesStrip({
  uploadOpen: uploadOpenProp,
  onUploadOpenChange,
}: StoriesStripProps = {}) {
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const router = useRouter();
  const t = useT();
  const hydrated = useStoreHydration();
  const storiesCache = useAppStore((s) => s.storiesFeed);
  const storiesFetched = useAppStore((s) => s.lastFetched.storiesFeed);
  const setStoriesFeedCache = useAppStore((s) => s.setStoriesFeedCache);

  const [groups, setGroups] = useState<StoryUserGroup[]>(() => {
    if (typeof window === "undefined") return [];
    return useAppStore.getState().storiesFeed?.groups ?? [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    const { storiesFeed, lastFetched } = useAppStore.getState();
    return !(storiesFeed && !isCacheExpired(lastFetched.storiesFeed));
  });
  const [uploadInternal, setUploadInternal] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const uploadOpen = uploadOpenProp ?? uploadInternal;
  const setUploadOpen = onUploadOpenChange ?? setUploadInternal;

  useEffect(() => {
    if (!hydrated || !storiesCache || isCacheExpired(storiesFetched)) return;
    setGroups(storiesCache.groups);
    setLoading(false);
  }, [hydrated, storiesCache, storiesFetched]);

  const load = useCallback(
    async (background = false) => {
      if (!background && groups.length === 0) setLoading(true);
      try {
        if (user?.uid) {
          void cleanupOwnExpiredStories(user.uid).catch(() => {});
        }
        const stories = await getActiveStories();
        const grouped = await groupStoriesByUser(stories, user?.uid);
        setGroups(grouped);
        setStoriesFeedCache(grouped);
      } finally {
        setLoading(false);
      }
    },
    [groups.length, setStoriesFeedCache, user?.uid],
  );

  useEffect(() => {
    if (!hydrated) return;
    const { storiesFeed, lastFetched } = useAppStore.getState();
    if (storiesFeed && !isCacheExpired(lastFetched.storiesFeed)) {
      setGroups(storiesFeed.groups);
      setLoading(false);
      void load(true);
      return;
    }
    void prefetchStoriesFeed().then(() => {
      const cached = useAppStore.getState().storiesFeed;
      if (cached) setGroups(cached.groups);
      void load(true);
    });
    const interval = window.setInterval(() => void load(true), 60_000);
    return () => window.clearInterval(interval);
  }, [hydrated, load]);

  const ownGroup = useMemo(
    () => groups.find((g) => g.userId === user?.uid),
    [groups, user?.uid],
  );

  const otherGroups = useMemo(
    () => groups.filter((g) => g.userId !== user?.uid),
    [groups, user?.uid],
  );

  const ownPhoto =
    profile?.photo_url || user?.photoURL || ownGroup?.userPhoto || "";
  const ownName =
    profile?.userName || profile?.display_name || user?.displayName || t("yourStory");

  function openViewer(groupIndex: number) {
    setViewerIndex(groupIndex);
  }

  function handleOwnClick() {
    if (!canUpload) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (ownGroup && ownGroup.stories.length > 0) {
      const idx = groups.findIndex((g) => g.userId === user?.uid);
      if (idx >= 0) openViewer(idx);
    } else {
      setUploadOpen(true);
    }
  }

  function handleOtherClick(group: StoryUserGroup) {
    const idx = groups.findIndex((g) => g.userId === group.userId);
    if (idx >= 0) openViewer(idx);
  }

  return (
    <>
      <section className="border-b border-border py-3">
        <div className="-mx-1 overflow-x-auto px-3 scrollbar-hide">
          <div className="flex gap-3">
            {canUpload && (
              <StoryRing
                label={ownName}
                photoUrl={ownPhoto}
                coverUrl={
                  ownGroup?.stories.length
                    ? storyCoverUrl(ownGroup.stories[ownGroup.stories.length - 1])
                    : undefined
                }
                hasUnviewed={Boolean(
                  ownGroup?.stories.some(
                    (s) => user && !s.viewedByIds.includes(user.uid),
                  ),
                )}
                isOwn
                showAdd
                onClick={handleOwnClick}
                onAddClick={() => setUploadOpen(true)}
              />
            )}

            {otherGroups.map((group) => (
              <StoryRing
                key={group.userId}
                label={group.userName}
                photoUrl={group.userPhoto}
                coverUrl={storyCoverUrl(group.stories[group.stories.length - 1])}
                hasUnviewed={group.hasUnviewed}
                onClick={() => handleOtherClick(group)}
              />
            ))}

            {loading && groups.length === 0 && (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex w-[72px] shrink-0 flex-col items-center gap-1">
                    <div className="h-[66px] w-[66px] animate-pulse rounded-full bg-surface-overlay" />
                    <div className="h-2 w-10 animate-pulse rounded bg-surface-overlay" />
                  </div>
                ))}
              </>
            )}

            {!loading && !canUpload && otherGroups.length === 0 && (
              <p className="self-center px-2 text-xs text-muted">{t("noStoriesYet")}</p>
            )}
          </div>
        </div>
      </section>

      <StoryUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={load}
      />

      {viewerIndex !== null && groups[viewerIndex] && (
        <StoryViewer
          groups={groups}
          startGroupIndex={viewerIndex}
          onClose={() => {
            setViewerIndex(null);
            load();
          }}
          onChanged={load}
        />
      )}
    </>
  );
}
