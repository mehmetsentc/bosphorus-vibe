"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useAdminFetch } from "@/lib/admin/client-fetch";
import { getFirebaseDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/types";

type PostRow = {
  id: string;
  postUserId: string;
  postText?: string;
  postVideo?: string;
  postImage?: string;
  postVideothumbnail?: string;
  timePosted?: string;
  numViews?: number;
};

export function AdminPosts() {
  const adminFetch = useAdminFetch();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [postId, setPostId] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, COLLECTIONS.userPosts),
        orderBy("timePosted", "desc"),
        limit(50),
      );
      const snap = await getDocs(q);
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          postUserId: d.data().postUserId ?? "",
          postText: d.data().postDescription ?? d.data().postText ?? "",
          postVideo: d.data().postVideo ?? "",
          postImage: d.data().postImage ?? "",
          postVideothumbnail: d.data().postVideothumbnail ?? "",
          timePosted: d.data().timePosted?.toDate?.()?.toISOString() ?? undefined,
          numViews: d.data().numViews ?? 0,
        })),
      );
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const deletePost = async (id: string) => {
    if (!confirm(`Post silinsin mi?\n${id}`)) return;
    setBusy(id);
    try {
      const res = await adminFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        flash("Silindi ✓");
      } else flash("Silme başarısız");
    } finally {
      setBusy(null);
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.id.includes(search) ||
      (p.postText ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.postUserId ?? "").includes(search),
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-white/50">Son 50 post · moderasyon</p>

      <div className="flex flex-wrap gap-2">
        <input
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="Post ID ile sil…"
          className="input-field min-w-[200px] flex-1"
        />
        <button
          type="button"
          disabled={!postId.trim() || !!busy}
          onClick={() => void deletePost(postId.trim())}
          className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          ID ile Sil
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Yenile
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Post ara (ID, metin, kullanıcı)…"
        className="input-field w-full max-w-md"
      />

      {msg && <p className="text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const thumb = p.postVideothumbnail || p.postImage;
            const isVideo = !!p.postVideo;
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-square bg-black/40">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      {isVideo ? "🎬" : "📸"}
                    </div>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isVideo ? "bg-purple-500/80 text-white" : "bg-blue-500/80 text-white"
                    }`}
                  >
                    {isVideo ? "VİDEO" : "FOTO"}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {p.postText && (
                    <p className="line-clamp-2 text-xs text-white/70">{p.postText}</p>
                  )}
                  <p className="truncate font-mono text-[10px] text-white/35">{p.id}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">
                      {p.timePosted
                        ? new Date(p.timePosted).toLocaleDateString("tr-TR")
                        : "—"}
                      {(p.numViews ?? 0) > 0 && ` · ${p.numViews} görüntülenme`}
                    </span>
                    <button
                      type="button"
                      disabled={busy === p.id}
                      onClick={() => void deletePost(p.id)}
                      className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                    >
                      {busy === p.id ? "…" : "Sil"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-white/40">Post bulunamadı</p>
      )}
    </div>
  );
}
