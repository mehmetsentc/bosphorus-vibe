"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getLikedPostsByUser } from "@/lib/services/firestore";
import { ProfilePostGrid } from "@/components/profile/ProfilePostGrid";
import { useT } from "@/components/providers/I18nProvider";
import type { UserPostDoc } from "@/types";

export default function FavoritesPage() {
  const { user } = useAuth();
  const t = useT();
  const [posts, setPosts] = useState<UserPostDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getLikedPostsByUser(user.uid)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        {t("favoritesTitle")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("favoritesDesc")}</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{t("noFavorites")}</p>
      ) : (
        <div className="mt-6">
          <ProfilePostGrid posts={posts} />
        </div>
      )}

      <Link href="/profile" className="mt-8 inline-block text-sm text-vibe hover:underline">
        {t("goToProfile")}
      </Link>
    </div>
  );
}
