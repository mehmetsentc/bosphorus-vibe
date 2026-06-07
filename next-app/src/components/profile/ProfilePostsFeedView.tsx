"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  enrichPostsWithUsers,
  getPostVideoUrl,
  getPostsByUser,
} from "@/lib/services/firestore";
import {
  ProfilePostFeed,
  type EnrichedProfilePost,
} from "@/components/profile/ProfilePostFeed";
import type { UserPostDoc } from "@/types";

type ProfileTab = "posts" | "reels" | "tagged";

function filterByTab(posts: UserPostDoc[], tab: ProfileTab): UserPostDoc[] {
  if (tab === "reels") {
    return posts.filter((p) => Boolean(getPostVideoUrl(p)));
  }
  if (tab === "tagged") return [];
  return posts;
}

function ProfilePostsFeedInner({
  uid,
  postId,
  backHref,
}: {
  uid: string;
  postId: string;
  backHref: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as ProfileTab) || "posts";
  const [posts, setPosts] = useState<EnrichedProfilePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostsByUser(uid)
      .then((raw) => filterByTab(raw, tab))
      .then(enrichPostsWithUsers)
      .then((enriched) => {
        if (!enriched.some((p) => p.id === postId)) {
          router.replace(backHref);
          return;
        }
        setPosts(enriched);
      })
      .finally(() => setLoading(false));
  }, [uid, postId, tab, backHref, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const backWithTab =
    tab !== "posts" ? `${backHref}?tab=${tab}` : backHref;

  return (
    <ProfilePostFeed
      posts={posts}
      initialPostId={postId}
      backHref={backWithTab}
    />
  );
}

export function ProfilePostsFeedView({
  uid,
  backHref,
}: {
  uid: string;
  backHref: string;
}) {
  const params = useParams<{ id: string }>();
  const postId = params.id;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <ProfilePostsFeedInner uid={uid} postId={postId} backHref={backHref} />
    </Suspense>
  );
}

export function OwnProfilePostsFeedView() {
  const { user } = useAuth();

  if (!user) return null;

  return <ProfilePostsFeedView uid={user.uid} backHref="/profile" />;
}
