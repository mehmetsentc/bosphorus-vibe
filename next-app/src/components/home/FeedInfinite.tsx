"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedPostCard } from "@/components/post/FeedPostCard";
import { FeedFriendSuggestions } from "@/components/feed/FeedFriendSuggestions";
import { FeedVideoSuggestions } from "@/components/feed/FeedVideoSuggestions";
import { FeedEventSuggestions } from "@/components/feed/FeedEventSuggestions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import {
  getSuggestedUsers,
  getFollowingSet,
  listUsersForFriends,
} from "@/lib/services/friends";
import {
  enrichPostsWithUsers,
  getUpcomingEventSuggestions,
  getVideoPosts,
} from "@/lib/services/firestore";
import { useFeedPosts } from "@/lib/hooks/usePosts";
import type { PublicUser } from "@/lib/services/friends";
import type { EnrichedPost } from "@/store/appStore";
import type { EventDoc } from "@/types";

type FeedRow =
  | { kind: "post"; post: EnrichedPost }
  | { kind: "friends" }
  | { kind: "videos" }
  | { kind: "events" };

const INSERT_EVERY = 3;
const SUGGESTION_CYCLE: Array<"friends" | "videos" | "events"> = [
  "friends",
  "videos",
  "events",
];

function buildFeedRows(
  posts: EnrichedPost[],
  availability: { friends: boolean; videos: boolean; events: boolean },
): FeedRow[] {
  const rows: FeedRow[] = [];
  let cycleIndex = 0;

  posts.forEach((post, index) => {
    rows.push({ kind: "post", post });

    if ((index + 1) % INSERT_EVERY !== 0) return;

    for (let attempt = 0; attempt < SUGGESTION_CYCLE.length; attempt++) {
      const type = SUGGESTION_CYCLE[cycleIndex % SUGGESTION_CYCLE.length];
      cycleIndex++;

      if (type === "friends" && availability.friends) {
        rows.push({ kind: "friends" });
        break;
      }
      if (type === "videos" && availability.videos) {
        rows.push({ kind: "videos" });
        break;
      }
      if (type === "events" && availability.events) {
        rows.push({ kind: "events" });
        break;
      }
    }
  });

  return rows;
}

export function FeedInfinite() {
  const t = useT();
  const { user } = useAuth();
  const {
    posts,
    hasMore,
    loading,
    loadingMore,
    loadMore,
  } = useFeedPosts();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [friendSuggestions, setFriendSuggestions] = useState<PublicUser[]>([]);
  const [videoSuggestions, setVideoSuggestions] = useState<EnrichedPost[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<EventDoc[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setFollowing(new Set());
      return;
    }
    getFollowingSet(user.uid).then(setFollowing);
  }, [user]);

  const loadSuggestions = useCallback(async (followingSet: Set<string>) => {
    const [friendsRaw, videosRaw, eventsRaw] = await Promise.all([
      user
        ? getSuggestedUsers(user.uid, followingSet, 8)
        : listUsersForFriends("", 8),
      getVideoPosts(10).then(enrichPostsWithUsers),
      getUpcomingEventSuggestions(8),
    ]);
    setFriendSuggestions(friendsRaw);
    setVideoSuggestions(videosRaw);
    setEventSuggestions(eventsRaw);
  }, [user]);

  useEffect(() => {
    loadSuggestions(following);
  }, [following, loadSuggestions]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          loadMore().finally(() => {
            loadingMoreRef.current = false;
          });
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, posts.length]);

  function handleFollowChange(uid: string) {
    setFollowing((prev) => {
      const next = new Set(prev);
      next.add(uid);
      return next;
    });
    setFriendSuggestions((prev) => prev.filter((u) => u.uid !== uid));
  }

  const feedPostIds = useMemo(() => new Set(posts.map((p) => p.id)), [posts]);

  const filteredVideoSuggestions = useMemo(
    () => videoSuggestions.filter((p) => !feedPostIds.has(p.id)).slice(0, 8),
    [videoSuggestions, feedPostIds],
  );

  const availability = useMemo(
    () => ({
      friends: friendSuggestions.length > 0,
      videos: filteredVideoSuggestions.length > 0,
      events: eventSuggestions.length > 0,
    }),
    [friendSuggestions.length, filteredVideoSuggestions.length, eventSuggestions.length],
  );

  const feedRows = useMemo(
    () => buildFeedRows(posts, availability),
    [posts, availability],
  );

  if (loading) {
    return (
      <section>
        {[0, 1, 2].map((i) => (
          <div key={i} className="border-b border-border">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3 w-28 animate-pulse rounded bg-surface-overlay" />
            </div>
            <div className="aspect-square w-full animate-pulse bg-surface-overlay" />
          </div>
        ))}
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className="py-16 text-center">
        <p className="text-sm text-muted">{t("noPostsInFeed")}</p>
      </section>
    );
  }

  return (
    <section>
      {feedRows.map((row, index) => {
        if (row.kind === "post") {
          return (
            <FeedPostCard
              key={row.post.id}
              post={row.post}
              followingIds={following}
              onFollowChange={handleFollowChange}
            />
          );
        }

        if (row.kind === "friends") {
          return (
            <FeedFriendSuggestions
              key={`suggest-friends-${index}`}
              users={friendSuggestions}
              following={following}
              onFollowChange={handleFollowChange}
            />
          );
        }

        if (row.kind === "videos") {
          return (
            <FeedVideoSuggestions
              key={`suggest-videos-${index}`}
              posts={filteredVideoSuggestions}
            />
          );
        }

        if (row.kind === "events") {
          return (
            <FeedEventSuggestions
              key={`suggest-events-${index}`}
              events={eventSuggestions}
            />
          );
        }

        return null;
      })}

      <div ref={sentinelRef} className="h-1" aria-hidden />

      {loadingMore && (
        <div className="flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-10 text-center text-xs text-muted">{t("feedEnd")}</p>
      )}
    </section>
  );
}
