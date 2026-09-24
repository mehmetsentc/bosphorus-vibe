"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  IconBookmark,
  IconHeart,
  IconShare,
} from "@/components/icons/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { triggerGuestModal } from "@/lib/hooks/useGuestModal";
import { useFeedPosts } from "@/lib/hooks/usePosts";
import { groupHomeStoryPosts } from "@/lib/home-story/group";
import { hasPostVideo, toggleLike, toggleSavePost } from "@/lib/services/firestore";
import { buildPostSharePayload } from "@/lib/utils/share-post";
import {
  getFastFlowPlaybackUrl,
  getPostFeedImageCandidates,
} from "@/lib/utils/video-sources";

const ShareSheet = dynamic(
  () => import("@/components/share/ShareSheet").then((m) => ({ default: m.ShareSheet })),
  { ssr: false },
);

const EDGE = 0.22;
const SWIPE_PX = 48;
const FILL_PAGES = 8;

export function HomeStoryFeed() {
  const t = useT();
  const { dateLocale, locale } = useI18n();
  const { posts, hasMore, loading, loadingMore, loadMore } = useFeedPosts();
  const groups = useMemo(() => groupHomeStoryPosts(posts), [posts]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [postIndex, setPostIndex] = useState(0);
  const fillRef = useRef(0);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const group = groups[groupIndex];
  const post = group?.posts[postIndex];

  useEffect(() => {
    if (groupIndex > groups.length - 1) {
      setGroupIndex(Math.max(0, groups.length - 1));
      setPostIndex(0);
    }
  }, [groupIndex, groups.length]);

  useEffect(() => {
    if (group && postIndex > group.posts.length - 1) setPostIndex(group.posts.length - 1);
  }, [group, postIndex]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const thin = groups.slice(0, 3).some((item) => item.posts.length < 10);
    const nearEnd = groups.length > 0 && groupIndex >= groups.length - 2;
    if (nearEnd || (thin && fillRef.current < FILL_PAGES)) {
      fillRef.current += 1;
      void loadMore();
    }
  }, [hasMore, loading, loadingMore, groups, groupIndex, loadMore]);

  const goToGroup = useCallback(
    (next: number) => {
      if (next < 0 || next >= groups.length) return;
      setGroupIndex(next);
      setPostIndex(0);
    },
    [groups.length],
  );

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    swipeRef.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || !group) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a")) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      goToGroup(dx < 0 ? groupIndex + 1 : groupIndex - 1);
      return;
    }
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * EDGE) {
      setPostIndex((index) => Math.max(0, index - 1));
    } else if (x > rect.width * (1 - EDGE)) {
      setPostIndex((index) => Math.min(group.posts.length - 1, index + 1));
    }
  }

  if (loading && posts.length === 0) {
    return <div className="min-h-[70dvh] animate-pulse bg-black" />;
  }

  if (!group || !post) {
    return (
      <section className="px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">{t("timelineEmptyTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("noPostsInFeed")}</p>
      </section>
    );
  }

  const image = getPostFeedImageCandidates(post)[0] || "";
  const video = hasPostVideo(post) ? getFastFlowPlaybackUrl(post) : "";
  const title = post.postTitle || post.postDescriptions?.[locale] || post.postDescription || "";
  const body =
    post.postTitle && (post.postDescriptions?.[locale] || post.postDescription)
      ? post.postDescriptions?.[locale] || post.postDescription || ""
      : "";
  const when = post.timePosted.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="relative min-h-[70dvh] w-full overflow-hidden bg-black text-white"
      style={{ height: "calc(100dvh - 11.5rem - var(--mobile-bottom-nav-height))" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {video ? (
        <video
          key={post.id}
          src={video}
          poster={image || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={post.id} src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/30" />

      <div className="absolute inset-x-0 top-0 z-20 px-3 pt-3">
        <div className="flex gap-1">
          {group.posts.map((item, index) => (
            <div key={item.id} className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full bg-white" style={{ width: index <= postIndex ? "100%" : "0%" }} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="max-w-[55%] truncate rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
            {group.userName}
          </span>
          <span className="text-xs font-semibold text-white/90">
            {postIndex + 1}/{group.posts.length} · {groupIndex + 1}/{groups.length}
          </span>
        </div>
      </div>

      {groupIndex > 0 && (
        <button
          type="button"
          aria-label={t("homeStoryPrevUser")}
          onClick={() => goToGroup(groupIndex - 1)}
          className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl"
        >
          ‹
        </button>
      )}
      {groupIndex < groups.length - 1 && (
        <button
          type="button"
          aria-label={t("homeStoryNextUser")}
          onClick={() => goToGroup(groupIndex + 1)}
          className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-xl"
        >
          ›
        </button>
      )}

      <StoryFooter
        post={post}
        title={title}
        body={body}
        when={when}
      />
    </div>
  );
}

function StoryFooter({
  post,
  title,
  body,
  when,
}: {
  post: ReturnType<typeof groupHomeStoryPosts>[number]["posts"][number];
  title: string;
  body: string;
  when: string;
}) {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const { canLike } = useAccess();
  const { prefs } = useSettings();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const likeLock = useRef(false);

  useEffect(() => {
    setLiked(user ? post.likedByIds.includes(user.uid) : false);
    setSaved(user ? post.savedByIds.includes(user.uid) : false);
  }, [post, user]);

  const href = `${hasPostVideo(post) ? `/feed/${post.id}` : `/post/${post.id}`}?from=/home`;

  async function like() {
    if (!canLike) {
      triggerGuestModal();
      return;
    }
    if (!user || likeLock.current) return;
    const next = !liked;
    setLiked(next);
    likeLock.current = true;
    try {
      await toggleLike(post.id, user.uid, !next);
      if (next && prefs.autoArchive && !saved) {
        await toggleSavePost(post.id, user.uid, false).catch(() => {});
        setSaved(true);
      }
    } catch {
      setLiked(!next);
    } finally {
      likeLock.current = false;
    }
  }

  async function save() {
    if (!canLike) {
      triggerGuestModal();
      return;
    }
    if (!user) return;
    const next = !saved;
    setSaved(next);
    try {
      await toggleSavePost(post.id, user.uid, !next);
    } catch {
      setSaved(!next);
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
      {title && <h2 className="text-xl font-bold leading-tight drop-shadow">{title}</h2>}
      {body && <p className="mt-2 line-clamp-3 text-sm text-white/90">{body}</p>}
      <p className="mt-2 text-xs text-white/70">{when}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(href)}
          className="flex-1 rounded-full bg-[#e10600] px-4 py-3 text-sm font-semibold text-white"
        >
          {t("homeStoryRead")} →
        </button>
        <Circle label={t("likes")} onClick={() => void like()}>
          <IconHeart size={20} filled={liked} className={liked ? "text-red-500" : "text-white"} />
        </Circle>
        <Circle label={t("save")} onClick={() => void save()}>
          <IconBookmark size={20} filled={saved} className={saved ? "text-gold" : "text-white"} />
        </Circle>
        <Circle label={t("share")} onClick={() => setShareOpen(true)}>
          <IconShare size={20} className="text-white" />
        </Circle>
      </div>
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={shareOpen ? buildPostSharePayload(post) : null}
      />
    </div>
  );
}

function Circle({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55"
    >
      {children}
    </button>
  );
}
