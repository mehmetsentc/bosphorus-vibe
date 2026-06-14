"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getDisplayPosts,
  markPostSeen,
  shouldLoadMoreForUnseen,
  type DisplayPostsOptions,
} from "@/lib/utils/seenPosts";

export function useSeenPosts(options?: DisplayPostsOptions) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [revision, setRevision] = useState(0);

  const markSeen = useCallback(
    (postId: string) => {
      markPostSeen(postId, userId);
      setRevision((n) => n + 1);
    },
    [userId],
  );

  const pinKey = options?.pinIds?.join("|") ?? "";

  const filterPosts = useCallback(
    <T extends { id: string }>(posts: T[]): T[] =>
      getDisplayPosts(posts, userId, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, pinKey, revision],
  );

  const needsMore = useCallback(
    (displayCount: number, hasMore: boolean) =>
      shouldLoadMoreForUnseen(displayCount, hasMore),
    [],
  );

  return useMemo(
    () => ({ markSeen, filterPosts, needsMore, revision }),
    [markSeen, filterPosts, needsMore, revision],
  );
}
