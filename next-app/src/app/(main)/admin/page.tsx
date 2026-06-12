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
    async (url: string, method: string, body?: unknown) => {
      setBusy(true);
      setMessage("");
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage(data.message ?? t("adminActionFailed"));
          return null;
        }
        return data;
      } catch {
        setMessage(t("adminActionFailed"));
        return null;
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
          onClick={async () => {
            const data = await adminFetch(`/api/admin/posts/${postId.trim()}`, "DELETE");
            if (data) setMessage(t("adminActionSuccess"));
          }}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("deletePost")}
        </button>
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-surface-card p-4">
        <h2 className="font-semibold">{t("adminTranscodeTitle")}</h2>
        <p className="text-sm text-muted">{t("adminTranscodeDesc")}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const data = await adminFetch("/api/admin/transcode/enqueue", "POST", {
                limit: 500,
              });
              if (data) {
                setMessage(
                  t("adminTranscodeEnqueueResult", {
                    marked: String(data.marked ?? 0),
                    scanned: String(data.scanned ?? 0),
                  }),
                );
              }
            }}
            className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {t("adminTranscodeEnqueue")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const data = await adminFetch("/api/admin/transcode/run", "POST", {
                limit: 3,
              });
              if (data) {
                setMessage(
                  t("adminTranscodeRunResult", {
                    processed: String(data.processed ?? 0),
                    succeeded: String(data.succeeded ?? 0),
                    failed: String(data.failed ?? 0),
                  }),
                );
              }
            }}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {t("adminTranscodeRun")}
          </button>
        </div>
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
          onClick={async () => {
            const data = await adminFetch(`/api/admin/events/${eventId.trim()}`, "DELETE");
            if (data) setMessage(t("adminActionSuccess"));
          }}
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
