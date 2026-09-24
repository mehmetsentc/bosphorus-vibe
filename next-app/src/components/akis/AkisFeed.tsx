"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import {
  IconBookmark,
  IconHeart,
  IconMessage,
  IconShare,
} from "@/components/icons/Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { triggerGuestModal } from "@/lib/hooks/useGuestModal";
import { enrichAkisPosts } from "@/lib/akis/enrich";
import { sortAkisPage } from "@/lib/akis/rank";
import {
  getAkisPostsPage,
  hasPostVideo,
  toggleLike,
  toggleSavePost,
} from "@/lib/services/firestore";
import { buildPostSharePayload } from "@/lib/utils/share-post";
import { dedupePostsById } from "@/lib/utils/dedupe-posts";
import type { EnrichedPost } from "@/store/appStore";

const PostCommentModal = dynamic(
  () =>
    import("@/components/post/PostCommentModal").then((m) => ({
      default: m.PostCommentModal,
    })),
  { ssr: false },
);

const ShareSheet = dynamic(
  () => import("@/components/share/ShareSheet").then((m) => ({ default: m.ShareSheet })),
  { ssr: false },
);

const PAGE_SIZE = 8;
const TYPE_MS = 1600;

export function AkisFeed() {
  const t = useT();
  const { posts, hasMore, loading, loadMore } = useAkisPosts();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          const id = (entry.target as HTMLElement).dataset.postId;
          if (id) setActiveId(id);
        }
      },
      { root, threshold: [0.6] },
    );
    for (const child of root.children) observer.observe(child);
    return () => observer.disconnect();
  }, [posts]);

  useEffect(() => {
    if (!activeId || !hasMore) return;
    const index = posts.findIndex((post) => post.id === activeId);
    if (index >= posts.length - 2) void loadMore();
  }, [activeId, hasMore, posts, loadMore]);

  return (
    <>
      <div className="hidden px-6 py-24 text-center md:block">
        <p className="text-sm text-muted">{t("akisMobileOnly")}</p>
      </div>

      <div
        ref={scrollerRef}
        className="h-[100dvh] snap-y snap-mandatory overflow-y-scroll overscroll-y-contain md:hidden"
        style={{ touchAction: "pan-y" }}
      >
        {loading && posts.length === 0 && (
          <div className="h-[100dvh] snap-start bg-black" />
        )}
        {posts.map((post, index) => (
          <AkisCard
            key={post.id}
            post={post}
            active={activeId ? activeId === post.id : index === 0}
            warm={activeId ? posts[posts.findIndex((item) => item.id === activeId) + 1]?.id === post.id : index === 1}
          />
        ))}
      </div>
    </>
  );
}

function useAkisPosts() {
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const seenRef = useRef(new Set<string>());
  const loadingRef = useRef(false);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (first: boolean) => {
    const key = first ? "__first__" : cursorRef.current?.id;
    if (!key || seenRef.current.has(key) || loadingRef.current) return;
    if (!first && !cursorRef.current) return;
    loadingRef.current = true;
    seenRef.current.add(key);
    if (first) setLoading(true);
    try {
      const page = await getAkisPostsPage(PAGE_SIZE, first ? null : cursorRef.current);
      cursorRef.current = page.lastDoc;
      const enriched = await enrichAkisPosts(sortAkisPage(page.posts));
      setPosts((current) => dedupePostsById([...current, ...enriched]));
      setHasMore(page.hasMore);
    } catch {
      seenRef.current.delete(key);
    } finally {
      loadingRef.current = false;
      if (first) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(true);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    await loadPage(false);
  }, [loadPage]);

  return { posts, hasMore, loading, loadMore };
}

function akisCaption(post: EnrichedPost, locale: string): string {
  if (post.postDescriptions?.[locale]) return post.postDescriptions[locale];
  return post.postDescription || post.postTitle || "";
}

function akisImage(post: EnrichedPost): string {
  return post.postPhotoURL_low || post.postPhotoURL || post.postPhoto || "";
}

function akisVideo(post: EnrichedPost): string {
  return post.postVideoURL_preview || post.postVideoURL_low || "";
}

function AkisCard({
  post,
  active,
  warm,
}: {
  post: EnrichedPost;
  active: boolean;
  warm: boolean;
}) {
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const { canLike, canComment } = useAccess();
  const { prefs } = useSettings();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likedByIds.length);
  const [commentOpen, setCommentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const likeLock = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef(0);
  const singleTap = useRef<number | null>(null);

  useEffect(() => {
    setLiked(user ? post.likedByIds.includes(user.uid) : false);
    setSaved(user ? post.savedByIds.includes(user.uid) : false);
    setLikeCount(post.likedByIds.length);
  }, [post, user]);

  const caption = akisCaption(post, locale);
  const image = akisImage(post);
  const video = akisVideo(post);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active, video]);

  const profileHref = post.postUserId ? `/user/${post.postUserId}` : null;
  const postHref = hasPostVideo(post) ? `/feed/${post.id}` : `/post/${post.id}`;

  const like = useCallback(async () => {
    if (!canLike) {
      triggerGuestModal();
      return;
    }
    if (!user || likeLock.current) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((count) => (next ? count + 1 : Math.max(0, count - 1)));
    likeLock.current = true;
    try {
      await toggleLike(post.id, user.uid, !next);
      if (next && prefs.autoArchive && !saved) {
        await toggleSavePost(post.id, user.uid, false).catch(() => {});
        setSaved(true);
      }
    } catch {
      setLiked(!next);
      setLikeCount(post.likedByIds.length);
    } finally {
      likeLock.current = false;
    }
  }, [canLike, liked, post.id, post.likedByIds.length, prefs.autoArchive, saved, user]);

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

  function openPost() {
    router.push(postHref);
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a")) return;
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (singleTap.current) window.clearTimeout(singleTap.current);
      singleTap.current = null;
      lastTap.current = 0;
      void like();
      return;
    }
    lastTap.current = now;
    singleTap.current = window.setTimeout(() => {
      singleTap.current = null;
      openPost();
    }, 280);
  }

  return (
    <article
      data-post-id={post.id}
      className="relative h-[100dvh] w-full shrink-0 snap-start snap-always overflow-hidden bg-black"
      onPointerUp={onPointerUp}
    >
      {video && (active || warm) ? (
        <video
          ref={videoRef}
          key={post.id}
          src={video}
          poster={post.postVideothumbnail || image || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={active}
          muted
          loop
          playsInline
        />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-[max(64px,env(safe-area-inset-top,0px))]">
        {profileHref ? (
          <Link href={profileHref} className="pointer-events-auto inline-flex max-w-[70%] items-center gap-2 text-white">
            <Avatar name={post.userName} photo={post.userPhoto} />
            <span className="truncate text-sm font-semibold drop-shadow">{post.userName || t("user")}</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 text-white">
            <Avatar name={post.userName} photo={post.userPhoto} />
            <span className="truncate text-sm font-semibold drop-shadow">{post.userName || t("user")}</span>
          </span>
        )}
      </div>

      <div className="absolute bottom-[calc(var(--mobile-bottom-nav-height)+4.5rem)] right-3 z-30 flex flex-col items-center gap-4">
        <RoundButton label={t("likes")} onClick={() => void like()}>
          <IconHeart size={22} filled={liked} className={liked ? "text-red-500" : "text-white"} />
          <span className="text-[11px] font-semibold text-white">{likeCount}</span>
        </RoundButton>
        <RoundButton
          label={t("comment")}
          onClick={() => {
            if (!canComment) {
              triggerGuestModal();
              return;
            }
            setCommentOpen(true);
          }}
        >
          <IconMessage size={22} className="text-white" />
        </RoundButton>
        <RoundButton label={t("share")} onClick={() => setShareOpen(true)}>
          <IconShare size={22} className="text-white" />
        </RoundButton>
        <RoundButton label={t("save")} onClick={() => void save()}>
          <IconBookmark size={22} filled={saved} className={saved ? "text-gold" : "text-white"} />
        </RoundButton>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/55 to-transparent px-4 pb-[calc(var(--mobile-bottom-nav-height)+0.75rem)] pt-24">
        <Typewriter text={caption} active={active} />
        <button
          type="button"
          onClick={openPost}
          className="pointer-events-auto mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          {t("akisOpenPost")}
        </button>
      </div>

      <PostCommentModal
        postId={post.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        initialCount={post.numComments}
      />
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={shareOpen ? buildPostSharePayload(post) : null}
      />
    </article>
  );
}

function Avatar({ name, photo }: { name?: string; photo?: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/50" />
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
      {(name || "?")[0]?.toUpperCase()}
    </span>
  );
}

function RoundButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex flex-col items-center gap-1 text-white">
      {children}
    </button>
  );
}

function Typewriter({ text, active }: { text: string; active: boolean }) {
  const [count, setCount] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!text) {
      setCount(0);
      return;
    }
    if (reduce) {
      setCount(text.length);
      return;
    }
    if (!active) return;
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / TYPE_MS);
      setCount(Math.ceil(progress * text.length));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduce, text]);

  if (!text) return null;
  const done = count >= text.length;
  return (
    <p className="pointer-events-none max-w-[75%] whitespace-pre-wrap text-sm font-medium text-white drop-shadow">
      {text.slice(0, count)}
      {!done && !reduce && (
        <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-white align-[-2px]" style={{ height: "1em" }} />
      )}
    </p>
  );
}
