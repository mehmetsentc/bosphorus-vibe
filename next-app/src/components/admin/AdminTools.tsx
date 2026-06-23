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

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 6000);
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

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <h3 className="font-semibold text-white">Video Encode</h3>
          <p className="admin-subtle mt-1 text-sm">
            Tüm videoları aynı formata çevirir: preview.mp4 (360p, hızlı başlangıç) + low.mp4
            (480p)
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
          <li>• Encode: Her videoya preview.mp4 + low.mp4 üretir (H.264, faststart)</li>
          <li>• Kapak: Bozuk/siyah thumbnail&apos;leri videodan JPEG kare üretir</li>
          <li>• Önce &ldquo;Kuyruğa Al&rdquo; → sonra &ldquo;Çalıştır&rdquo; adımlarını uygula</li>
          <li>• Her &ldquo;Çalıştır&rdquo; 5 video işler; tamamlanana kadar tekrarla</li>
          <li>• Arka planda her 10 dakikada otomatik 5 video encode edilir</li>
        </ul>
      </section>
    </div>
  );
}
