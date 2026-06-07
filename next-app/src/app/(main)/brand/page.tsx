"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllEvents, getRecentPosts } from "@/lib/services/firestore";
import { EventPosterGrid } from "@/components/brand/EventPosterGrid";
import { ProfileLayout } from "@/components/profile/ProfileLayout";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { IgLinkButton } from "@/components/profile/ProfileActions";
import { IconGrid, IconReels, IconTagged } from "@/components/icons/Icons";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";
import { useT } from "@/components/providers/I18nProvider";
import { BRAND_INSTAGRAM } from "@/lib/brand";
import type { EventDoc, UserPostDoc } from "@/types";

type BrandTab = "posts" | "reels" | "tagged";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function BrandPage() {
  const t = useT();
  const [tab, setTab] = useState<BrandTab>("posts");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [posts, setPosts] = useState<UserPostDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllEvents(), getRecentPosts(30)])
      .then(([ev, recent]) => {
        setEvents(ev);
        setPosts(recent);
      })
      .finally(() => setLoading(false));
  }, []);

  const posterEvents = useMemo(
    () => events.filter((e) => e.eventImage),
    [events],
  );

  const postCount = posterEvents.length || posts.length;

  const tabs = [
    { id: "posts", icon: IconGrid, label: t("postsTab") },
    { id: "reels", icon: IconReels, label: t("navReels") },
    { id: "tagged", icon: IconTagged, label: t("taggedTab") },
  ];

  const bio = (
    <>
      <p>{t("brandBio1")}</p>
      <p>{t("brandBio2")}</p>
      <p>{t("brandBio3")}</p>
    </>
  );

  return (
    <ProfileLayout
      username={BRAND_INSTAGRAM.handle}
      displayName={BRAND_INSTAGRAM.displayName}
      photoUrl="/logo.png"
      bio={bio}
      stats={[
        { value: formatCount(postCount), label: t("posts") },
        { value: formatCount(BRAND_INSTAGRAM.followers), label: t("followers") },
        { value: formatCount(BRAND_INSTAGRAM.following), label: t("following") },
      ]}
      actions={
        <>
          <IgLinkButton href={BRAND_INSTAGRAM.url} className="flex-1 md:flex-none">
            {t("followOnInstagram")}
          </IgLinkButton>
        </>
      }
      tabs={
        <ProfileTabs
          tabs={tabs}
          active={tab}
          onChange={(id) => setTab(id as BrandTab)}
        />
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : tab === "tagged" ? (
        <p className="py-16 text-center text-sm text-muted">
          {t("noTaggedPostsShort")}
        </p>
      ) : tab === "reels" ? (
        <ProfilePostGrid posts={posts} aspect="reel" pinnedCount={0} />
      ) : (
        <EventPosterGrid events={events} />
      )}
    </ProfileLayout>
  );
}
