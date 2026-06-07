"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateUserProfile } from "@/lib/services/auth";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  ProfilePhotoModal,
  type ProfilePhotoModalHandle,
} from "@/components/profile/ProfilePhotoModal";
import { useT } from "@/components/providers/I18nProvider";
import { isAnimationTeamRole } from "@/lib/utils/roles";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface-card px-3 py-2.5 text-sm outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20";

export function EditProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const t = useT();
  const photoModalRef = useRef<ProfilePhotoModalHandle>(null);

  const [displayName, setDisplayName] = useState(
    () => profile?.display_name || user?.displayName || "",
  );
  const [userName, setUserName] = useState(
    () => profile?.userName || profile?.display_name || "",
  );
  const [bio, setBio] = useState(() => profile?.bio || "");
  const [role, setRole] = useState(() => profile?.role || "Hotel Guest");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile && !user) return;
    setDisplayName(profile?.display_name || user?.displayName || "");
    setUserName(profile?.userName || profile?.display_name || "");
    setBio(profile?.bio || "");
    setRole(profile?.role || "Hotel Guest");
  }, [profile, user]);

  const photoUrl = profile?.photo_url || user?.photoURL || "";
  const showRoleField = !isAnimationTeamRole(profile?.role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    try {
      await updateUserProfile(user.uid, {
        display_name: displayName,
        userName,
        bio,
        ...(showRoleField ? { role } : {}),
      });
      await refreshProfile();
      router.push("/profile");
    } catch {
      setError(t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[870px] pb-10">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
          <Link
            href="/profile"
            aria-label={t("back")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-overlay hover:text-foreground"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">{t("editProfileTitle")}</h1>
        </header>

        <form onSubmit={handleSubmit} className="px-6 pt-6">
          <div className="flex flex-col items-center gap-3 pb-6">
            <ProfileAvatar
              photoUrl={photoUrl}
              displayName={displayName || t("profileDefault")}
              size="lg"
            />
            <button
              type="button"
              onClick={() => photoModalRef.current?.openPicker()}
              className="text-sm font-semibold text-vibe transition hover:text-gold"
            >
              {t("changeProfilePhoto")}
            </button>
          </div>

          <p className="mb-6 text-sm text-muted">{t("editProfileSubtitle")}</p>

          <div className="space-y-5">
            <Field id="displayName" label={t("yourName")}>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
                autoComplete="name"
                required
              />
            </Field>

            <Field id="userName" label={t("userNameLabel")}>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={inputClass}
                autoComplete="username"
                required
              />
            </Field>

            {showRoleField && (
              <Field id="role" label={t("roleLabel")}>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                >
                  <option value="Animation Team">{t("roleAnimationTeam")}</option>
                  <option value="Hotel Guest">{t("roleHotelGuest")}</option>
                  <option value="Others">{t("roleOthers")}</option>
                </select>
              </Field>
            )}

            <Field id="bio" label={t("yourBio")}>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder={t("yourBio")}
              />
            </Field>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="gold-gradient mt-10 w-full rounded-full py-3.5 text-sm font-bold text-black shadow-gold transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? t("uploading") : t("saveChanges")}
          </button>
        </form>
      </div>

      <ProfilePhotoModal ref={photoModalRef} onSuccess={refreshProfile} />
    </>
  );
}
