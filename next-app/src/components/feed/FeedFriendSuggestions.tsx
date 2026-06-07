"use client";

import Link from "next/link";
import { followUser } from "@/lib/services/friends";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useRouter } from "next/navigation";
import { useT } from "@/components/providers/I18nProvider";
import type { PublicUser } from "@/lib/services/friends";

type FeedFriendSuggestionsProps = {
  users: PublicUser[];
  following: Set<string>;
  onFollowChange: (uid: string) => void;
};

export function FeedFriendSuggestions({
  users,
  following,
  onFollowChange,
}: FeedFriendSuggestionsProps) {
  const t = useT();
  const { user } = useAuth();
  const router = useRouter();
  const { canLike } = useAccess();

  if (!users.length) return null;

  async function handleFollow(uid: string) {
    if (!canLike) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (!user || following.has(uid)) return;
    try {
      await followUser(user.uid, uid);
      onFollowChange(uid);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="border-b border-border bg-background py-4">
      <div className="mb-3 flex items-center justify-between px-3">
        <h3 className="text-sm font-semibold">{t("feedSuggestFriends")}</h3>
        <Link href="/team" className="text-xs font-semibold text-gold">
          {t("seeAll")}
        </Link>
      </div>
      <div className="events-scroll -mx-1 px-3">
        <div className="flex gap-3 pb-1">
          {users.map((u) => {
            const isFollowing = following.has(u.uid);
            const name = u.display_name || u.userName || "user";
            return (
              <div
                key={u.uid}
                className="flex w-[140px] shrink-0 flex-col items-center rounded-2xl border border-border bg-surface-card px-3 py-4"
              >
                <Link href={`/user/${u.uid}?from=/home`}>
                  {u.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.photo_url}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-overlay text-xl font-bold text-gold">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <Link
                  href={`/user/${u.uid}?from=/home`}
                  className="mt-2 max-w-full truncate text-center text-xs font-semibold hover:underline"
                >
                  {name}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-center text-[10px] text-muted">
                  @{u.userName || name}
                </p>
                <button
                  type="button"
                  onClick={() => handleFollow(u.uid)}
                  disabled={isFollowing}
                  className={`mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition ${
                    isFollowing
                      ? "bg-surface-overlay text-muted"
                      : "bg-gold text-black hover:brightness-110"
                  }`}
                >
                  {isFollowing ? t("following") : t("follow")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
