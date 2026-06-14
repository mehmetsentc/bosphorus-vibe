"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { followUser } from "@/lib/services/friends";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useT } from "@/components/providers/I18nProvider";
import type { PublicUser } from "@/lib/services/friends";

type MemberCardProps = {
  user: PublicUser;
  isFollowing: boolean;
  onFollowChange: (uid: string) => void;
  from?: string;
};

export function MemberCard({
  user,
  isFollowing,
  onFollowChange,
  from = "/members",
}: MemberCardProps) {
  const t = useT();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { canLike } = useAccess();
  const name = user.display_name || user.userName || "user";
  const isSelf = authUser?.uid === user.uid;

  async function handleFollow() {
    if (isSelf || isFollowing) return;
    if (!canLike) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    if (!authUser) return;
    try {
      await followUser(authUser.uid, user.uid);
      onFollowChange(user.uid);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-surface-card px-3 py-4">
      <Link href={`/user/${user.uid}?from=${encodeURIComponent(from)}`}>
        {user.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photo_url}
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
        href={`/user/${user.uid}?from=${encodeURIComponent(from)}`}
        className="mt-2 max-w-full truncate text-center text-xs font-semibold hover:underline"
      >
        {name}
      </Link>
      <p className="mt-0.5 line-clamp-1 text-center text-[10px] text-muted">
        @{user.userName || name}
      </p>
      {!isSelf && (
        <button
          type="button"
          onClick={handleFollow}
          disabled={isFollowing}
          className={`mt-3 w-full rounded-lg py-1.5 text-xs font-semibold transition ${
            isFollowing
              ? "bg-surface-overlay text-muted"
              : "bg-gold text-black hover:brightness-110"
          }`}
        >
          {isFollowing ? t("following") : t("follow")}
        </button>
      )}
    </div>
  );
}
