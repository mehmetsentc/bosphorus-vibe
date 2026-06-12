"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  enqueueThumbnailRegenClient,
  enqueueTranscodeClient,
  runThumbnailBatchClient,
  runTranscodeBatchClient,
} from "@/lib/admin/client-ops";

export function AdminTools() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 5000); };

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
    <div className="space-y-4">
      <div>
        <h2 className="font-bold">Araçlar</h2>
        <p className="text-sm text-muted">Sistem işlemleri</p>
      </div>

      {msg && (
        <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {msg}
        </div>
      )}

      {/* Transcode */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-4">
        <div>
          <h3 className="font-semibold">Video Transcode</h3>
          <p className="text-xs text-muted">Yüklenen videoları 480p low-quality versiyonuna dönüştür</p>
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
            {busy ? "İşleniyor…" : "Transcode Kuyruğuna Al (500 video)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                const token = await user!.getIdToken(true);
                const d = await runTranscodeBatchClient(token, 3);
                return `✓ ${d.processed} işlendi — ${d.succeeded} başarılı, ${d.failed} başarısız`;
              })
            }
            className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Transcode Çalıştır (3 video)"}
          </button>
        </div>
      </div>

      {/* Thumbnail backfill */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-4">
        <div>
          <h3 className="font-semibold">Video Kapak Fotoğrafı</h3>
          <p className="text-xs text-muted">
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
            className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? "İşleniyor…" : "Kapak Üret (5 video)"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <h3 className="mb-2 font-semibold">Bilgi</h3>
        <div className="space-y-1 text-xs text-muted">
          <p>• Transcode: Firebase Storage&apos;daki videoları küçük boyuta indirir</p>
          <p>• Kapak: Bozuk/siyah thumbnail&apos;leri videodan JPEG kare üretir</p>
          <p>• Önce &ldquo;Kuyruğa Al&rdquo; → sonra &ldquo;Çalıştır&rdquo; adımlarını uygula</p>
          <p>• Her &ldquo;Çalıştır&rdquo; birkaç video işler; tamamlanana kadar tekrarla</p>
        </div>
      </div>
    </div>
  );
}
