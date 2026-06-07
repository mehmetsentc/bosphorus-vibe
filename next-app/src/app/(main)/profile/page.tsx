"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getPostVideoUrl } from "@/lib/services/firestore";
import { signOutUser } from "@/lib/services/auth";
import { useProfile } from "@/lib/hooks/useProfile";
import { FriendManageModal } from "@/components/profile/FriendManageModal";
import { VideoUploadModal } from "@/components/upload/VideoUploadModal";
import { PostManageModal } from "@/components/post/PostManageModal";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { ProfileHighlights } from "@/components/profile/ProfileHighlights";
import { StoryUploadModal } from "@/components/stories/StoryUploadModal";
import { StoryViewer } from "@/components/stories/StoryViewer";
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
import {
  buildProfileHighlightItems,
  groupStoriesByCategory,
} from "@/lib/utils/story-categories";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { BRAND_NAME } from "@/lib/brand";
import type { StoryCategory } from "@/types";

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
  const [highlightCategory, setHighlightCategory] = useState<StoryCategory | null>(
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

  const storyCategoryLabels = useMemo(
    (): Record<StoryCategory, string> => ({
      vibe: BRAND_NAME,
      reels: t("navReels"),
      events: t("eventsHighlight"),
    }),
    [t],
  );

  const highlights = useMemo(
    () => buildProfileHighlightItems(myStories, storyCategoryLabels),
    [myStories, storyCategoryLabels],
  );

  const highlightViewerGroups = useMemo(() => {
    if (!highlightCategory || !user) return [];
    const grouped = groupStoriesByCategory(myStories);
    const stories = grouped[highlightCategory];
    if (!stories.length) return [];

    return [
      {
        userId: user.uid,
        userName: username,
        userPhoto: photoUrl,
        stories,
        hasUnviewed: false,
        latestAt: stories[stories.length - 1]?.storyPostedAt ?? new Date(0),
      },
    ];
  }, [highlightCategory, myStories, user, username, photoUrl]);

  function handleHighlightSelect(category: StoryCategory) {
    setHighlightCategory(category);
  }

  const hasStoryHighlights = highlights.some((h) => h.count > 0);

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
              items={highlights}
              activeId={highlightCategory}
              onSelect={handleHighlightSelect}
              onAddStory={
                !hasStoryHighlights
                  ? () => setStoryUploadOpen(true)
                  : undefined
              }
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

      {highlightCategory && highlightViewerGroups.length > 0 && (
        <StoryViewer
          groups={highlightViewerGroups}
          startGroupIndex={0}
          onClose={() => {
            setHighlightCategory(null);
            refresh();
          }}
          onChanged={refresh}
        />
      )}
    </>
  );
}
