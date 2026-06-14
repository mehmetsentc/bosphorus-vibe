"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { signOutUser } from "@/lib/services/auth";
import { useProfile } from "@/lib/hooks/useProfile";
import dynamic from "next/dynamic";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { ProfileHighlights } from "@/components/profile/ProfileHighlights";

// Heavy modals — only load when opened
const FriendManageModal = dynamic(
  () => import("@/components/profile/FriendManageModal").then((m) => ({ default: m.FriendManageModal })),
  { ssr: false },
);
const VideoUploadModal = dynamic(
  () => import("@/components/upload/VideoUploadModal").then((m) => ({ default: m.VideoUploadModal })),
  { ssr: false },
);
const PostManageModal = dynamic(
  () => import("@/components/post/PostManageModal").then((m) => ({ default: m.PostManageModal })),
  { ssr: false },
);
const StoryUploadModal = dynamic(
  () => import("@/components/stories/StoryUploadModal").then((m) => ({ default: m.StoryUploadModal })),
  { ssr: false },
);
const HighlightEditorModal = dynamic(
  () =>
    import("@/components/stories/HighlightEditorModal").then((m) => ({
      default: m.HighlightEditorModal,
    })),
  { ssr: false },
);
const StoryViewer = dynamic(
  () => import("@/components/stories/StoryViewer").then((m) => ({ default: m.StoryViewer })),
  { ssr: false },
);
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import {
  ProfilePhotoModal,
  type ProfilePhotoModalHandle,
} from "@/components/profile/ProfilePhotoModal";
import { IgButton, igBtn } from "@/components/profile/ProfileActions";
import {
  IconGrid,
  IconMoon,
  IconMusic,
  IconPlay,
  IconReels,
  IconTagged,
  IconUserPlus,
} from "@/components/icons/Icons";
import { isAnimationTeamRole } from "@/lib/utils/roles";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/providers/I18nProvider";
import { useStoryHighlights } from "@/lib/hooks/useStoryHighlights";
import { getStoriesByIds } from "@/lib/services/stories";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { BRAND_NAME } from "@/lib/brand";
import type { StoryHighlightDoc } from "@/types";

type ProfileTab = "posts" | "reels" | "tagged";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const photoModalRef = useRef<ProfilePhotoModalHandle>(null);
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [highlightStories, setHighlightStories] = useState<
    import("@/types").StoryDoc[]
  >([]);
  const [highlightEditorOpen, setHighlightEditorOpen] = useState(false);
  const [editHighlight, setEditHighlight] = useState<StoryHighlightDoc | null>(
    null,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [managePost, setManagePost] = useState<
    import("@/types").UserPostDoc | null
  >(null);
  const [friendOpen, setFriendOpen] = useState(false);
  const [storyUploadOpen, setStoryUploadOpen] = useState(false);

  const {
    posts: myPosts,
    taggedPosts,
    stories: myStories,
    followers,
    following,
    loading,
    refreshing,
    refresh,
  } = useProfile();
  const {
    items: storyHighlights,
    refresh: refreshHighlights,
  } = useStoryHighlights(user?.uid);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "posts" || urlTab === "reels" || urlTab === "tagged") {
      setTab(urlTab);
    }
  }, [searchParams]);

  async function handleLogout() {
    await signOutUser();
    router.replace("/welcome");
  }

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile`;
    if (navigator.share) {
      await navigator.share({ title: t("profileShareTitle"), url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  const displayName =
    profile?.display_name || profile?.userName || user?.displayName || t("profileDefault");
  const username =
    profile?.userName || profile?.display_name || user?.displayName || "user";
  const photoUrl = profile?.photo_url || user?.photoURL || "";
  const bioText = profile?.bio || profile?.title || "";

  const reelPosts = useMemo(
    () => myPosts.filter((p) => Boolean(getPostVideoUrl(p))),
    [myPosts],
  );

  useEffect(() => {
    if (!activeHighlightId) {
      setHighlightStories([]);
      return;
    }
    const highlight = storyHighlights.find((h) => h.id === activeHighlightId);
    if (!highlight?.storyIds.length) {
      setHighlightStories([]);
      return;
    }
    void getStoriesByIds(highlight.storyIds).then(setHighlightStories);
  }, [activeHighlightId, storyHighlights]);

  const highlightViewerGroups = useMemo(() => {
    if (!activeHighlightId || !user || !highlightStories.length) return [];
    return [
      {
        userId: user.uid,
        userName: username,
        userPhoto: photoUrl,
        stories: highlightStories,
        hasUnviewed: false,
        latestAt: highlightStories[highlightStories.length - 1]?.storyPostedAt ?? new Date(0),
      },
    ];
  }, [activeHighlightId, highlightStories, user, username, photoUrl]);

  function handleHighlightSelect(id: string) {
    setActiveHighlightId(id);
  }

  function handleHighlightEdit(id: string) {
    const item = storyHighlights.find((h) => h.id === id);
    if (!item) return;
    setEditHighlight(item);
    setHighlightEditorOpen(true);
  }

  function handleHighlightsSaved() {
    refreshHighlights();
    refresh();
  }

  const noteText = bioText ? bioText.split("\n")[0] : `${BRAND_NAME} ✨`;
  const vibeLine = profile?.title || BRAND_NAME;

  const tabs = [
    { id: "posts", icon: IconGrid, label: t("postsTab") },
    { id: "reels", icon: IconReels, label: t("navReels") },
    { id: "tagged", icon: IconTagged, label: t("taggedTab") },
  ];

  const bio = (
    <>
      {profile?.role && profile.role !== "user" && (
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-overlay px-2.5 py-1 text-xs text-muted">
          <IconMoon size={12} />
          {profile.role}
        </span>
      )}
      {bioText && (
        <p className="mt-2 whitespace-pre-line leading-snug">{bioText}</p>
      )}
      {isAnimationTeamRole(profile?.role) && (
        <p className="mt-2 text-vibe">
          {t("totalParticipants")}{" "}
          <span className="font-bold text-foreground">
            {formatCount(profile?.total_activity_participants ?? 0)}
          </span>
        </p>
      )}
      <button
        type="button"
        className="mt-2 flex max-w-full items-center gap-1.5 text-muted"
      >
        <IconMusic size={14} className="shrink-0 text-foreground" />
        <IconPlay size={10} className="shrink-0" />
        <span className="truncate">{vibeLine}</span>
      </button>
    </>
  );

  return (
    <>
      <PullToRefresh onRefresh={refresh} refreshing={refreshing}>
        {refreshing && (
          <div className="flex justify-center py-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}
        <ProfileLayout
          username={username}
          displayName={displayName}
          photoUrl={photoUrl}
          avatarNote={noteText}
          onChangePhoto={() => photoModalRef.current?.openPicker()}
          bio={bio}
          stats={[
            { value: formatCount(myPosts.length), label: t("posts") },
            { value: formatCount(followers), label: t("followers") },
            { value: formatCount(following), label: t("following") },
          ]}
          menu={
            <ProfileMenu
              onLogout={handleLogout}
              onUploadReel={() => setUploadOpen(true)}
            />
          }
          actions={
            <>
              <Link href="/profile/edit" className={`inline-flex flex-1 items-center justify-center md:flex-none ${igBtn()}`}>
                {t("editProfile")}
              </Link>
              <IgButton onClick={handleShareProfile} className="flex-1 md:flex-none">
                {t("shareProfile")}
              </IgButton>
              <button
                type="button"
                onClick={() => setFriendOpen(true)}
                aria-label={t("addFriend")}
                title={t("addFriend")}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-surface-overlay transition hover:bg-surface-card"
              >
                <IconUserPlus size={18} />
              </button>
            </>
          }
          highlights={
            <ProfileHighlights
              items={storyHighlights}
              activeId={activeHighlightId}
              onSelect={handleHighlightSelect}
              onCreate={() => {
                setEditHighlight(null);
                setHighlightEditorOpen(true);
              }}
              onEdit={handleHighlightEdit}
              isOwner
            />
          }
          tabs={
            <ProfileTabs
              tabs={tabs}
              active={tab}
              onChange={(id) => setTab(id as ProfileTab)}
            />
          }
        >
          {loading ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-sm" />
              ))}
            </div>
          ) : tab === "tagged" ? (
            taggedPosts.length ? (
              <ProfilePostGrid
                posts={taggedPosts}
                aspect="square"
                ownerId={user?.uid}
                onManagePost={setManagePost}
                feedPath="/profile/posts"
                tab="tagged"
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted">
                {t("noTaggedPosts")}
              </p>
            )
          ) : (
            <ProfilePostGrid
              posts={tab === "reels" ? reelPosts : myPosts}
              aspect={tab === "reels" ? "reel" : "square"}
              ownerId={user?.uid}
              onManagePost={setManagePost}
              feedPath="/profile/posts"
              tab={tab}
            />
          )}
        </ProfileLayout>
      </PullToRefresh>

      <ProfilePhotoModal
        ref={photoModalRef}
        onSuccess={refreshProfile}
      />

      <VideoUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={refresh}
      />

      <StoryUploadModal
        open={storyUploadOpen}
        onClose={() => setStoryUploadOpen(false)}
        onSuccess={refresh}
      />

      <PostManageModal
        post={managePost}
        open={Boolean(managePost)}
        onClose={() => setManagePost(null)}
        onUpdated={refresh}
      />

      <FriendManageModal
        open={friendOpen}
        onClose={() => setFriendOpen(false)}
        onChanged={refresh}
      />

      {activeHighlightId && highlightViewerGroups.length > 0 && (
        <StoryViewer
          groups={highlightViewerGroups}
          startGroupIndex={0}
          highlightMode
          onClose={() => setActiveHighlightId(null)}
          onChanged={handleHighlightsSaved}
        />
      )}

      {user?.uid && (
        <HighlightEditorModal
          open={highlightEditorOpen}
          userId={user.uid}
          editHighlight={editHighlight}
          onClose={() => {
            setHighlightEditorOpen(false);
            setEditHighlight(null);
          }}
          onSaved={handleHighlightsSaved}
        />
      )}
    </>
  );
}
