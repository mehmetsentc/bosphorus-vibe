"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isCacheExpired } from "@/lib/cache/constants";
import { useStoreHydration } from "@/lib/hooks/useStoreHydration";
import {
  getFollowStats,
  getPostsByUser,
  getPostsTaggingUser,
} from "@/lib/services/firestore";
import {
  cleanupOwnExpiredStories,
  getStoriesByUser,
} from "@/lib/services/stories";
import { useAppStore } from "@/store/appStore";

export function useProfile() {
  const { user } = useAuth();
  const uid = user?.uid;
  const hydrated = useStoreHydration();
  const profileData = useAppStore((s) => s.profileData);
  const lastFetched = useAppStore((s) => s.lastFetched.profile);
  const setProfileData = useAppStore((s) => s.setProfileData);
  const clearProfileCache = useAppStore((s) => s.clearProfileCache);

  const fetchRef = useRef(0);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);

  const hasValidCache =
    hydrated &&
    Boolean(uid) &&
    profileData?.uid === uid &&
    !isCacheExpired(lastFetched);

  const fetchProfile = useCallback(
    async (force = false) => {
      if (!uid) return;

      if (
        !force &&
        profileData?.uid === uid &&
        !isCacheExpired(lastFetched)
      ) {
        return;
      }

      const requestId = ++fetchRef.current;
      const isInitial = !profileData || profileData.uid !== uid;
      if (force) setRefreshing(true);
      else if (isInitial) setFetching(true);

      try {
        const [posts, stats, tagged] = await Promise.all([
          getPostsByUser(uid),
          getFollowStats(uid),
          getPostsTaggingUser(uid),
        ]);
        await cleanupOwnExpiredStories(uid).catch(() => {});
        const stories = await getStoriesByUser(uid);

        if (requestId !== fetchRef.current) return;

        setProfileData({
          uid,
          posts,
          taggedPosts: tagged,
          stories,
          followers: stats.followers,
          following: stats.following,
        });
      } finally {
        if (requestId === fetchRef.current) {
          setFetching(false);
          setRefreshing(false);
        }
      }
    },
    [uid, profileData, lastFetched, setProfileData],
  );

  useEffect(() => {
    if (!hydrated || !uid) return;
    void fetchProfile(false);
  }, [hydrated, uid, fetchProfile]);

  const refresh = useCallback(async () => {
    clearProfileCache();
    await fetchProfile(true);
  }, [clearProfileCache, fetchProfile]);

  const data =
    profileData?.uid === uid
      ? profileData
      : null;

  return {
    posts: data?.posts ?? [],
    taggedPosts: data?.taggedPosts ?? [],
    stories: data?.stories ?? [],
    followers: data?.followers ?? 0,
    following: data?.following ?? 0,
    /** True only on first fetch when no cache exists */
    loading: hydrated && Boolean(uid) && !hasValidCache && fetching,
    refreshing,
    hasCache: hasValidCache,
    refresh,
    invalidate: refresh,
  };
}
