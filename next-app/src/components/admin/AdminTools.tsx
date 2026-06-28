"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  configureAllVideoStorageUntilDone,
  enqueueThumbnailRegenClient,
  enqueueTranscodeClient,
  runThumbnailBatchClient,
  runTranscodeBatchClient,
} from "@/lib/admin/client-ops";

export function AdminTools() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 8000);
  };

  const withBusy = useCallback(
    async (fn: () => Promise<string>) => {
      if (!user) {
        flash("Oturum gerekli");
        return;
      }
      setBusy(true);
      setMsg("");
      try {
        flash(await fn());
      } catch (e) {
        flash(e instanceof Error ? e.message : "Hata oluştu");
      } finally {
        setBusy(false);
      }
    },
    [user],
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {msg && (
        <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {msg}
        </div>
      )}

      <section className="space-y-3 rounded-2xl border border-gold/30 bg-gold/5 p-5">
        <div>
          <h3 className="font-semibold text-white">Hızlı Video Akışı — Otomatik Storage</h3>
          <p className="admin-subtle mt-1 text-sm">
            Tüm videolar için preview/low katmanlarını Storage&apos;dan senkronize eder,
            eksikleri encode kuyruğuna alır ve batch çalıştırır. Arka planda her 10 dk
            otomatik devam eder.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            withBusy(async () => {
              const getIdToken = () => user!.getIdToken(true);
              const { rounds, last } = await configureAllVideoStorageUntilDone(
                getIdToken,
                15,
                (round, r) => {
                  setMsg(
                    `Tur ${round}: sync ${r.sync.synced ?? 0}, kuyruk +${r.enqueue.marked ?? 0}, encode ${r.transcode.succeeded ?? 0}/${r.transcode.processed ?? 0}…`,
                  );
                },
              );
              return `✓ ${rounds} tur — sync ${last.sync.synced ?? 0}, kuyruk ${last.enqueue.marked ?? 0}, encode ${last.transcode.succeeded ?? 0} başarılı${last.hasMore ? " (devam ediyor — tekrar çalıştırın veya 10 dk bekleyin)" : ""}`;
            })
          }
          className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Storage yapılandırılıyor…" : "Tüm Storage'ı Yapılandır (Otomatik)"}
        </button>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h3 className="font-semibold text-white">Video Encode (Manuel)</h3>
          <p className="admin-subtle mt-1 text-sm">
            preview.mp4 (540p, hızlı başlangıç) + low/medium/high MP4 — H.264 faststart
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                const d = await enqueueTranscodeClient(500);
                return `✓ ${d.marked} video sıraya alındı (${d.scanned} tarandı)`;
              })
            }
            className="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Encode Kuyruğuna Al (500 video)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                const token = await user!.getIdToken(true);
                const d = await runTranscodeBatchClient(token, 5);
                return `✓ ${d.processed} işlendi — ${d.succeeded} başarılı, ${d.failed} başarısız`;
              })
            }
            className="admin-muted w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Encode Çalıştır (5 video)"}
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h3 className="font-semibold text-white">Video Kapak Fotoğrafı</h3>
          <p className="admin-subtle mt-1 text-sm">
            Eski videolardan kare çekerek grid/feed için kapak fotoğrafı üret
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                const d = await enqueueThumbnailRegenClient(500);
                return `✓ ${d.marked} video sıraya alındı (${d.scanned} tarandı)`;
              })
            }
            className="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Kapak Kuyruğuna Al (500 video)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                const token = await user!.getIdToken(true);
                const d = await runThumbnailBatchClient(token, 5);
                return `✓ ${d.processed} işlendi — ${d.succeeded} başarılı, ${d.failed} başarısız`;
              })
            }
            className="admin-muted w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Kapak Üret (5 video)"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-2 font-semibold text-white">Bilgi</h3>
        <ul className="admin-subtle space-y-1.5 text-sm">
          <li>• Otomatik: Storage sync → kuyruk → preview/low encode (her 10 dk arka plan)</li>
          <li>• CLI: <code className="text-white/80">node scripts/storage-video-pipeline.mjs</code></li>
          <li>• Yeni upload: anında transcode (onCreate + onUpdate pending)</li>
          <li>• Oynatma: preview.mp4 ile hızlı başlangıç, hata olursa low → original</li>
        </ul>
      </section>
    </div>
  );
}
