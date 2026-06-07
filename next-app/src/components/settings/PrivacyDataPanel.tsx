"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/providers/I18nProvider";
import { signOutUser } from "@/lib/services/auth";
import { SettingsInfoBlock, SettingsSection } from "@/components/settings/SettingsUI";

export function PrivacyDataPanel() {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function handleExport() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        setMessage(t("dataExportFailed"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bosphorus-vibe-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(t("dataExportSuccess"));
    } catch {
      setMessage(t("dataExportFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (confirm !== "DELETE") {
      setMessage(t("dataDeleteConfirmHint"));
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (!res.ok) {
        setMessage(t("dataDeleteFailed"));
        return;
      }
      await signOutUser();
      router.replace("/welcome");
    } catch {
      setMessage(t("dataDeleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SettingsSection title={t("dataPrivacyTitle")}>
        <SettingsInfoBlock>{t("dataPrivacyDesc")}</SettingsInfoBlock>
        <div className="space-y-3 px-4 pb-4">
          <button
            type="button"
            disabled={busy}
            onClick={handleExport}
            className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold disabled:opacity-50"
          >
            {t("dataExportButton")}
          </button>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t("dataDeletePlaceholder")}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="w-full rounded-xl bg-red-500/90 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("dataDeleteButton")}
          </button>
          {message && <p className="text-center text-xs text-muted">{message}</p>}
        </div>
      </SettingsSection>
    </>
  );
}
