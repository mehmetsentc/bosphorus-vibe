"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { adminFetch } from "@/lib/admin/client-fetch";
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
      setPosts(snap.docs.map((d) => ({
        id: d.id,
        postUserId: d.data().postUserId ?? "",
        postText: d.data().postText ?? "",
        postVideo: d.data().postVideo ?? "",
        postImage: d.data().postImage ?? "",
        postVideothumbnail: d.data().postVideothumbnail ?? "",
        timePosted: d.data().timePosted?.toDate?.()?.toISOString() ?? null,
        numViews: d.data().numViews ?? 0,
      })));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const deletePost = async (id: string) => {
    if (!confirm(`Post silinsin mi? (${id})`)) return;
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

  const deleteById = async () => {
    const id = postId.trim();
    if (!id) return;
    await deletePost(id);
    setPostId("");
  };

  const filtered = posts.filter((p) =>
    p.id.includes(search) ||
    (p.postText ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.postUserId ?? "").includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Postlar <span className="text-sm font-normal text-muted">(son 50)</span></h2>
        <button type="button" onClick={load} className="rounded-xl border border-border px-3 py-1.5 text-xs">Yenile</button>
      </div>

      {/* Delete by ID */}
      <div className="flex gap-2">
        <input
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder="Post ID ile sil…"
          className="input-field flex-1"
        />
        <button
          type="button"
          disabled={!postId.trim() || !!busy}
          onClick={deleteById}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Sil
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Post ara (ID, metin, kullanıcı)…"
        className="input-field w-full"
      />

      {msg && <p className="text-center text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const thumb = p.postVideothumbnail || p.postImage;
            const isVideo = !!p.postVideo;
            return (
              <div key={p.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-card p-3">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-overlay text-2xl">
                    {isVideo ? "🎬" : "📸"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isVideo ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {isVideo ? "VİDEO" : "FOTOĞRAF"}
                    </span>
                    {(p.numViews ?? 0) > 0 && <span className="text-[11px] text-muted">{p.numViews} görüntülenme</span>}
                  </div>
                  {p.postText && <p className="mt-0.5 line-clamp-2 text-xs text-foreground/80">{p.postText}</p>}
                  <p className="mt-0.5 truncate font-mono text-[10px] text-muted">{p.id}</p>
                  {p.timePosted && (
                    <p className="text-[11px] text-muted">{new Date(p.timePosted).toLocaleDateString("tr-TR")}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => deletePost(p.id)}
                  className="shrink-0 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {busy === p.id ? "…" : "Sil"}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">Post bulunamadı</p>}
        </div>
      )}
    </div>
  );
}
