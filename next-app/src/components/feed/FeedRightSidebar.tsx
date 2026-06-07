"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useT } from "@/components/providers/I18nProvider";
import {
  followUser,
  getFollowingSet,
  getSuggestedUsers,
  type PublicUser,
} from "@/lib/services/friends";
import { useAccess } from "@/lib/hooks/useAccess";
import { useRouter } from "next/navigation";
import { BRAND_NAME } from "@/lib/brand";

function UserAvatar({
  photo,
  name,
  size = "md",
}: {
  photo?: string;
  name: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-border`}
      />
    );
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-surface-overlay text-sm font-bold text-gold`}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function FeedRightSidebar() {
  const t = useT();
  const { user, profile } = useAuth();
  const router = useRouter();
  const { canLike } = useAccess();
  const [suggestions, setSuggestions] = useState<PublicUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const followingSet = await getFollowingSet(user!.uid);
      if (cancelled) return;
      setFollowing(followingSet);
      const suggested = await getSuggestedUsers(user!.uid, followingSet, 5);
      if (!cancelled) setSuggestions(suggested);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleFollow(uid: string) {
    if (!canLike) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (!user || following.has(uid)) return;
    try {
      await followUser(user.uid, uid);
      setFollowing((prev) => new Set(prev).add(uid));
    } catch {
      /* ignore */
    }
  }

  const displayName =
    profile?.display_name || profile?.userName || user?.displayName || t("user");
  const username = profile?.userName || profile?.display_name || "user";

  return (
    <div className="space-y-6 pt-2">
      {user && (
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="flex min-w-0 items-center gap-3">
            <UserAvatar photo={profile?.photo_url} name={displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted">@{username}</p>
            </div>
          </Link>
          <Link
            href="/profile"
            className="shrink-0 text-xs font-semibold text-gold hover:brightness-110"
          >
            {t("switchAccount")}
          </Link>
        </div>
      )}

      {suggestions.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted">
              {t("feedSuggestFriends")}
            </h3>
            <Link href="/team" className="text-xs font-semibold hover:text-foreground">
              {t("seeAll")}
            </Link>
          </div>
          <ul className="space-y-3">
            {suggestions.map((u) => {
              const name = u.display_name || u.userName || "user";
              const isFollowing = following.has(u.uid);
              return (
                <li key={u.uid} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/user/${u.uid}?from=/home`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <UserAvatar photo={u.photo_url} name={name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      <p className="truncate text-xs text-muted">
                        @{u.userName || name}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleFollow(u.uid)}
                    disabled={isFollowing}
                    className={`shrink-0 text-xs font-semibold ${
                      isFollowing ? "text-muted" : "text-gold hover:brightness-110"
                    }`}
                  >
                    {isFollowing ? t("following") : t("follow")}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <footer className="space-y-2 text-[11px] leading-relaxed text-muted">
        <nav className="flex flex-wrap gap-x-1.5 gap-y-1">
          <Link href="/privacy-policy" className="hover:underline">
            {t("privacyPolicy")}
          </Link>
          <span>·</span>
          <Link href="/terms-of-service" className="hover:underline">
            {t("termsOfService")}
          </Link>
          <span>·</span>
          <Link href="/cookie-policy" className="hover:underline">
            {t("cookiePolicy")}
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} {BRAND_NAME}</p>
      </footer>
    </div>
  );
}
