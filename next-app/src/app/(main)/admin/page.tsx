"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useT } from "@/components/providers/I18nProvider";
import { signOutUser } from "@/lib/services/auth";
import { PageShell } from "@/components/layout/PageShell";

export default function AdminPage() {
  const t = useT();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isAdmin } = useRole();
  const [postId, setPostId] = useState("");
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const adminFetch = useCallback(
    async (url: string, method: string) => {
      setBusy(true);
      setMessage("");
      try {
        const res = await fetch(url, { method });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage(data.message ?? t("adminActionFailed"));
          return;
        }
        setMessage(t("adminActionSuccess"));
      } catch {
        setMessage(t("adminActionFailed"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  if (loading) {
    return (
      <PageShell className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vibe border-t-transparent" />
      </PageShell>
    );
  }

  if (!user || !isAdmin) {
    return (
      <PageShell className="px-4 py-16 text-center">
        <p className="text-muted">{t("adminForbidden")}</p>
      </PageShell>
    );
  }

  return (
    <PageShell className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold">{t("adminTitle")}</h1>
      <p className="mt-2 text-sm text-muted">{t("adminSubtitle")}</p>

      <section className="mt-8 space-y-4 rounded-2xl border border-border bg-surface-card p-4">
        <h2 className="font-semibold">{t("adminDeletePost")}</h2>
        <input
          type="text"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
          placeholder={t("adminPostIdPlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy || !postId.trim()}
          onClick={() => adminFetch(`/api/admin/posts/${postId.trim()}`, "DELETE")}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("deletePost")}
        </button>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-surface-card p-4">
        <h2 className="font-semibold">{t("adminDeleteEvent")}</h2>
        <input
          type="text"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder={t("adminEventIdPlaceholder")}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy || !eventId.trim()}
          onClick={() => adminFetch(`/api/admin/events/${eventId.trim()}`, "DELETE")}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("adminDeleteEvent")}
        </button>
      </section>

      {message && (
        <p className="mt-4 text-center text-sm text-muted">{message}</p>
      )}

      <button
        type="button"
        onClick={() => router.push("/home")}
        className="mt-8 w-full rounded-xl border border-border py-3 text-sm"
      >
        {t("back")}
      </button>
    </PageShell>
  );
}
