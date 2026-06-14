"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getFollowingSet,
  listRegisteredMembers,
  type PublicUser,
} from "@/lib/services/friends";

const MEMBERS_PAGE_SIZE = 100;

export function useAllMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<PublicUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [users, followingSet] = await Promise.all([
          listRegisteredMembers(user?.uid ?? "", MEMBERS_PAGE_SIZE),
          user
            ? getFollowingSet(user.uid)
            : Promise.resolve(new Set<string>()),
        ]);
        if (cancelled) return;
        setMembers(
          [...users].sort((a, b) =>
            (a.display_name || a.userName || "").localeCompare(
              b.display_name || b.userName || "",
              undefined,
              { sensitivity: "base" },
            ),
          ),
        );
        setFollowing(followingSet);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const markFollowing = useCallback((uid: string) => {
    setFollowing((prev) => new Set(prev).add(uid));
  }, []);

  return { members, following, loading, markFollowing };
}
