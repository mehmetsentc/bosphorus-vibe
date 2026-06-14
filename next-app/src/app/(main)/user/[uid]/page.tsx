"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getUserDoc } from "@/lib/services/auth";
import {
  getPostsByUser,
  getFollowStats,
  getPostVideoUrl,
  getPostsTaggingUser,
} from "@/lib/services/firestore";
import { getStoriesByUser, getStoriesByIds } from "@/lib/services/stories";
import { useStoryHighlights } from "@/lib/hooks/useStoryHighlights";
import dynamic from "next/dynamic";
import { ProfileHighlights } from "@/components/profile/ProfileHighlights";

const StoryViewer = dynamic(
  () => import("@/components/stories/StoryViewer").then((m) => ({ default: m.StoryViewer })),
  { ssr: false },
);
import { findOrCreateDirectChat } from "@/lib/services/messages";
import { followUser, isFollowing, unfollowUser } from "@/lib/services/friends";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { IgButton } from "@/components/profile/ProfileActions";
import { IconGrid, IconReels, IconTagged } from "@/components/icons/Icons";
import { useT } from "@/components/providers/I18nProvider";
import type { StoryDoc, UserDoc, UserPostDoc } from "@/types";

type ProfileTab = "posts" | "reels" | "tagged";

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
        </main>
      }
    >
      <UserProfilePageContent />
    </Suspense>
  );
}

function UserProfilePageContent() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const t = useT();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [posts, setPosts] = useState<UserPostDoc[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<UserPostDoc[]>([]);
  const [stories, setStories] = useState<StoryDoc[]>([]);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [highlightStories, setHighlightStories] = useState<StoryDoc[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFriend, setIsFriend] = useState(false);
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [loading, setLoading] = useState(true);
  const [friendBusy, setFriendBusy] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);
  const { items: storyHighlights } = useStoryHighlights(uid);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const [doc, userPosts, userStories, stats, followingThem, tagged] = await Promise.all([
      getUserDoc(uid),
      getPostsByUser(uid),
      getStoriesByUser(uid),
      getFollowStats(uid),
      user ? isFollowing(user.uid, uid) : Promise.resolve(false),
      getPostsTaggingUser(uid),
    ]);
    setProfile(doc);
    setPosts(userPosts);
    setTaggedPosts(tagged);
    setStories(userStories);
    setFollowers(stats.followers);
    setFollowing(stats.following);
    setIsFriend(followingThem);
    setLoading(false);
  }, [uid, user]);

  useEffect(() => {
    if (user?.uid === uid) {
      router.replace("/profile");
      return;
    }
    load();
  }, [load, router, uid, user?.uid]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "posts" || urlTab === "reels" || urlTab === "tagged") {
      setTab(urlTab);
    }
  }, [searchParams]);

  async function handleMessage() {
    if (!user || !uid) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    setMessageBusy(true);
    try {
      const chatId = await findOrCreateDirectChat(user.uid, uid);
      router.push(`/messages/${chatId}`);
    } finally {
      setMessageBusy(false);
    }
  }

  async function handleFriendToggle() {
    if (!user || !uid) return;
    setFriendBusy(true);
    try {
      if (isFriend) {
        await unfollowUser(user.uid, uid);
        setIsFriend(false);
      } else {
        await followUser(user.uid, uid);
        setIsFriend(true);
      }
      const stats = await getFollowStats(uid);
      setFollowers(stats.followers);
    } finally {
      setFriendBusy(false);
    }
  }

  const reelPosts = useMemo(
    () => posts.filter((p) => Boolean(getPostVideoUrl(p))),
    [posts],
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
    if (!activeHighlightId || !profile || !uid || !highlightStories.length) {
      return [];
    }
    return [
      {
        userId: uid,
        userName: profile.userName || profile.display_name || "user",
        userPhoto: profile.photo_url || "",
        stories: highlightStories,
        hasUnviewed: false,
        latestAt:
          highlightStories[highlightStories.length - 1]?.storyPostedAt ??
          new Date(0),
      },
    ];
  }, [activeHighlightId, highlightStories, profile, uid]);

  if (loading || !profile) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
      </main>
    );
  }

  const displayName = profile.display_name || profile.userName || t("profileDefault");
  const username = profile.userName || profile.display_name || "user";

  const tabs = [
    { id: "posts", icon: IconGrid, label: t("postsTab") },
    { id: "reels", icon: IconReels, label: t("navReels") },
    { id: "tagged", icon: IconTagged, label: t("taggedTab") },
  ];

  return (
    <>
    <ProfileLayout
      username={username}
      displayName={displayName}
      photoUrl={profile.photo_url}
      bio={profile.bio ? <p>{profile.bio}</p> : undefined}
      backLink={
        <Link href="/team" className="text-sm text-vibe hover:underline">
          ← {t("back")}
        </Link>
      }
      stats={[
        { value: formatCount(posts.length), label: t("posts") },
        { value: formatCount(followers), label: t("followers") },
        { value: formatCount(following), label: t("following") },
      ]}
      actions={
        <>
          <IgButton
            disabled={!user || friendBusy}
            onClick={handleFriendToggle}
            className={`flex-1 md:flex-none ${
              isFriend
                ? "!bg-surface-card"
                : "!bg-vibe !text-background hover:opacity-90"
            }`}
          >
            {friendBusy ? "…" : isFriend ? t("unfollow") : t("follow")}
          </IgButton>
          <IgButton
            disabled={!user || messageBusy}
            onClick={handleMessage}
            className="flex-1 md:flex-none"
          >
            {messageBusy ? "…" : t("message")}
          </IgButton>
        </>
      }
      highlights={
        storyHighlights.length > 0 ? (
          <ProfileHighlights
            items={storyHighlights}
            activeId={activeHighlightId}
            onSelect={setActiveHighlightId}
          />
        ) : undefined
      }
      tabs={
        <ProfileTabs
          tabs={tabs}
          active={tab}
          onChange={(id) => setTab(id as ProfileTab)}
        />
      }
    >
      {tab === "tagged" ? (
        taggedPosts.length ? (
          <ProfilePostGrid
            posts={taggedPosts}
            aspect="square"
            feedPath={`/user/${uid}/posts`}
            tab="tagged"
          />
        ) : (
          <p className="py-16 text-center text-sm text-muted">
            {t("noTaggedPostsShort")}
          </p>
        )
      ) : (
        <ProfilePostGrid
          posts={tab === "reels" ? reelPosts : posts}
          aspect={tab === "reels" ? "reel" : "square"}
          feedPath={`/user/${uid}/posts`}
          tab={tab}
        />
      )}
    </ProfileLayout>

      {activeHighlightId && highlightViewerGroups.length > 0 && (
        <StoryViewer
          groups={highlightViewerGroups}
          startGroupIndex={0}
          highlightMode
          onClose={() => setActiveHighlightId(null)}
          onChanged={load}
        />
      )}
    </>
  );
}
