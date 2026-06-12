"use client";

import { useCallback, useEffect, useState } from "react";

type EventRow = {
  id: string;
  eventName: string;
  eventDate: string | null;
  eventCategory: string;
  eventLocation: string;
  eventDescription: string;
  eventTimeLabel: string;
  eventImage: string;
  isHighlight: boolean;
  eventSortId: number;
  view: number;
};

const EMPTY_FORM = {
  eventName: "",
  eventTimeLabel: "",
  eventDate: new Date().toISOString().slice(0, 10),
  eventCategory: "show" as "show" | "sports",
  eventLocation: "",
  eventImage: "",
  eventDescription: "",
  isHighlight: false,
  eventSortId: 0,
};

export function AdminEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (ev: EventRow) => {
    setEditId(ev.id);
    setForm({
      eventName: ev.eventName,
      eventTimeLabel: ev.eventTimeLabel,
      eventDate: ev.eventDate ? ev.eventDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      eventCategory: (ev.eventCategory as "show" | "sports") ?? "show",
      eventLocation: ev.eventLocation,
      eventImage: ev.eventImage,
      eventDescription: ev.eventDescription,
      isHighlight: ev.isHighlight,
      eventSortId: ev.eventSortId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.eventName.trim()) { flash("Etkinlik adı gerekli"); return; }
    setBusy(true);
    try {
      const body = {
        ...form,
        eventDate: new Date(form.eventDate).toISOString(),
        eventSortId: Number(form.eventSortId),
      };
      const url = editId ? `/api/admin/events/${editId}` : "/api/admin/events";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId
          ? { eventName: form.eventName, eventDescription: form.eventDescription, eventLocation: form.eventLocation }
          : body),
      });
      if (res.ok) {
        flash(editId ? "Etkinlik güncellendi ✓" : "Etkinlik oluşturuldu ✓");
        setShowForm(false);
        load();
      } else {
        flash("Hata oluştu");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) { flash("Silindi ✓"); load(); }
      else flash("Silme başarısız");
    } finally {
      setBusy(false);
    }
  };

  const filtered = events.filter((e) =>
    e.eventName.toLowerCase().includes(search.toLowerCase()) ||
    e.eventLocation.toLowerCase().includes(search.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-foreground">← Geri</button>
          <h2 className="font-bold">{editId ? "Etkinlik Düzenle" : "Yeni Etkinlik"}</h2>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-4">
          <Field label="Etkinlik Adı *">
            <input value={form.eventName} onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))} className="input-field" placeholder="Mongolian Circus" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tarih">
              <input type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} className="input-field" />
            </Field>
            <Field label="Saat (örn: 21:30)">
              <input value={form.eventTimeLabel} onChange={(e) => setForm((f) => ({ ...f, eventTimeLabel: e.target.value }))} className="input-field" placeholder="21:30" />
            </Field>
          </div>
          <Field label="Kategori">
            <select value={form.eventCategory} onChange={(e) => setForm((f) => ({ ...f, eventCategory: e.target.value as "show" | "sports" }))} className="input-field">
              <option value="show">🎭 Gösteri Saati</option>
              <option value="sports">⚽ Spor</option>
            </select>
          </Field>
          <Field label="Konum">
            <input value={form.eventLocation} onChange={(e) => setForm((f) => ({ ...f, eventLocation: e.target.value }))} className="input-field" placeholder="Terrace Stage" />
          </Field>
          <Field label="Görsel URL">
            <input value={form.eventImage} onChange={(e) => setForm((f) => ({ ...f, eventImage: e.target.value }))} className="input-field" placeholder="https://..." />
          </Field>
          <Field label="Açıklama">
            <textarea value={form.eventDescription} onChange={(e) => setForm((f) => ({ ...f, eventDescription: e.target.value }))} className="input-field min-h-[80px] resize-none" rows={3} />
          </Field>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isHighlight} onChange={(e) => setForm((f) => ({ ...f, isHighlight: e.target.checked }))} className="h-4 w-4 accent-gold" />
              Günün Showu (öne çıkar)
            </label>
          </div>
          {!editId && (
            <Field label="Sıralama ID">
              <input type="number" value={form.eventSortId} onChange={(e) => setForm((f) => ({ ...f, eventSortId: Number(e.target.value) }))} className="input-field" />
            </Field>
          )}
        </div>

        {msg && <p className="text-center text-sm text-gold">{msg}</p>}

        <button type="button" onClick={handleSave} disabled={busy} className="w-full rounded-xl bg-gold py-3 font-semibold text-black disabled:opacity-50">
          {busy ? "Kaydediliyor…" : editId ? "Güncelle" : "Etkinlik Oluştur"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Etkinlikler <span className="text-sm font-normal text-muted">({events.length})</span></h2>
        <button type="button" onClick={openCreate} className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-black">
          + Yeni Etkinlik
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Etkinlik ara…"
        className="input-field w-full"
      />

      {msg && <p className="text-center text-sm text-gold">{msg}</p>}

      {loading ? (
        <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-card p-3">
              {ev.eventImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ev.eventImage} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{ev.eventName}</p>
                  {ev.isHighlight && <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">GÜNÜN SHOWU</span>}
                </div>
                <p className="text-xs text-muted">
                  {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("tr-TR") : "—"} {ev.eventTimeLabel && `· ${ev.eventTimeLabel}`} {ev.eventLocation && `· ${ev.eventLocation}`}
                </p>
                <p className="mt-0.5 text-[11px] text-muted capitalize">{ev.eventCategory}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openEdit(ev)} className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-surface-overlay">
                  Düzenle
                </button>
                <button type="button" onClick={() => handleDelete(ev.id, ev.eventName)} disabled={busy} className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/20">
                  Sil
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">Etkinlik bulunamadı</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}
