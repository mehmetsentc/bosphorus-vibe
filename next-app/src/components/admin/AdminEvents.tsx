"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  createAdminEventClient,
  deleteAdminEventClient,
  fetchAdminEventsClient,
  updateAdminEventClient,
  type AdminEventRow,
  type FirebaseCategory,
} from "@/lib/admin/client-ops";

const EMPTY_FORM = {
  eventName: "",
  eventTimeLabel: "",
  eventDate: new Date().toISOString().slice(0, 10),
  eventCategory: "SHOW TIME" as FirebaseCategory,
  eventLocation: "",
  eventImage: "",
  eventDescription: "",
  isHighlight: false,
  eventSortId: 0,
};

export function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setEvents(await fetchAdminEventsClient());
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (ev: AdminEventRow) => {
    setEditId(ev.id);
    setForm({
      eventName: ev.eventName,
      eventTimeLabel: ev.eventTimeLabel,
      eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      eventCategory: (["SHOW TIME", "daily", "weekly"].includes(ev.eventCategory)
        ? ev.eventCategory
        : "SHOW TIME") as FirebaseCategory,
      eventLocation: ev.eventLocation,
      eventImage: ev.eventImage,
      eventDescription: ev.eventDescription,
      isHighlight: ev.isHighlight,
      eventSortId: ev.eventSortId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.eventName.trim()) {
      flash("Etkinlik adı gerekli");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        eventSortId: Number(form.eventSortId),
      };
      if (editId) {
        await updateAdminEventClient(editId, payload);
        flash("Etkinlik güncellendi ✓");
      } else {
        await createAdminEventClient(payload);
        flash("Etkinlik oluşturuldu ✓");
      }
      setShowForm(false);
      await load();
    } catch {
      flash("Hata oluştu");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    setBusy(true);
    try {
      await deleteAdminEventClient(id);
      flash("Silindi ✓");
      await load();
    } catch {
      flash("Silme başarısız");
    } finally {
      setBusy(false);
    }
  };

  const filtered = events.filter(
    (e) =>
      e.eventName.toLowerCase().includes(search.toLowerCase()) ||
      e.eventLocation.toLowerCase().includes(search.toLowerCase()),
  );

  if (showForm) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-sm text-white/50 hover:text-white"
          >
            ← Listeye dön
          </button>
          <h2 className="text-lg font-bold">{editId ? "Etkinlik Düzenle" : "Yeni Etkinlik"}</h2>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Field label="Etkinlik Adı *">
            <input
              value={form.eventName}
              onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
              className="input-field"
              placeholder="Mongolian Circus"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tarih">
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="input-field"
              />
            </Field>
            <Field label="Saat (örn: 21:30)">
              <input
                value={form.eventTimeLabel}
                onChange={(e) => setForm((f) => ({ ...f, eventTimeLabel: e.target.value }))}
                className="input-field"
                placeholder="21:30"
              />
            </Field>
          </div>
          <Field label="Kategori">
            <select
              value={form.eventCategory}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventCategory: e.target.value as FirebaseCategory }))
              }
              className="input-field"
            >
              <option value="SHOW TIME">🎭 SHOW TIME</option>
              <option value="daily">⚽ daily</option>
              <option value="weekly">🔄 weekly</option>
            </select>
          </Field>
          <Field label="Konum">
            <input
              value={form.eventLocation}
              onChange={(e) => setForm((f) => ({ ...f, eventLocation: e.target.value }))}
              className="input-field"
              placeholder="Terrace Stage"
            />
          </Field>
          <Field label="Görsel URL">
            <input
              value={form.eventImage}
              onChange={(e) => setForm((f) => ({ ...f, eventImage: e.target.value }))}
              className="input-field"
              placeholder="https://..."
            />
          </Field>
          <Field label="Açıklama">
            <textarea
              value={form.eventDescription}
              onChange={(e) => setForm((f) => ({ ...f, eventDescription: e.target.value }))}
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isHighlight}
              onChange={(e) => setForm((f) => ({ ...f, isHighlight: e.target.checked }))}
              className="h-4 w-4 accent-gold"
            />
            Günün Showu (öne çıkar)
          </label>
          <Field label="Sıralama ID">
            <input
              type="number"
              value={form.eventSortId}
              onChange={(e) => setForm((f) => ({ ...f, eventSortId: Number(e.target.value) }))}
              className="input-field"
            />
          </Field>
        </div>

        {msg && <p className="text-center text-sm text-gold">{msg}</p>}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={busy}
          className="w-full rounded-xl bg-gold py-3 font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Kaydediliyor…" : editId ? "Güncelle" : "Etkinlik Oluştur"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          Toplam <span className="font-semibold text-white">{events.length}</span> etkinlik
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black"
        >
          + Yeni Etkinlik
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Etkinlik ara…"
        className="input-field w-full max-w-md"
      />

      {msg && <p className="text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-4 py-3">Etkinlik</th>
                <th className="hidden px-4 py-3 md:table-cell">Tarih</th>
                <th className="hidden px-4 py-3 lg:table-cell">Konum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((ev) => (
                <tr key={ev.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ev.eventImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ev.eventImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-white">{ev.eventName}</p>
                        <p className="text-xs text-white/40 capitalize">{ev.eventCategory}</p>
                        {ev.isHighlight && (
                          <span className="mt-0.5 inline-block rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                            GÜNÜN SHOWU
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-white/60 md:table-cell">
                    {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("tr-TR") : "—"}
                    {ev.eventTimeLabel && ` · ${ev.eventTimeLabel}`}
                  </td>
                  <td className="hidden max-w-[160px] truncate px-4 py-3 text-white/60 lg:table-cell">
                    {ev.eventLocation || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(ev)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(ev.id, ev.eventName)}
                        disabled={busy}
                        className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/25"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">Etkinlik bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}
