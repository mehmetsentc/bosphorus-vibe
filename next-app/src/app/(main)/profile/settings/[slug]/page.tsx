"use client";

import { notFound } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import {
  SettingsChoiceRow,
  SettingsInfoBlock,
  SettingsScreen,
  SettingsSection,
  SettingsToggleRow,
  SettingsUserList,
} from "@/components/settings/SettingsUI";
import { SettingsUserSearch } from "@/components/settings/SettingsUserSearch";
import { FriendManageModal } from "@/components/profile/FriendManageModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { LOCALE_LABELS } from "@/i18n/locale-labels";
import type { Locale } from "@/i18n/detect";
import { BRAND_NAME } from "@/lib/brand";
import { updateUserMessagePrivacy } from "@/lib/services/auth";
import { PrivacyDataPanel } from "@/components/settings/PrivacyDataPanel";
import type { AppPreferences } from "@/lib/settings/preferences";

const VALID_SLUGS = [
  "notifications",
  "time",
  "privacy",
  "close-friends",
  "blocked",
  "comments",
  "messages",
  "tags",
  "sharing",
  "restricted",
  "limit-interactions",
  "hidden-words",
  "friends",
  "muted",
  "content",
  "like-counts",
  "permissions",
  "archive",
  "accessibility",
  "language",
  "media-quality",
  "theme",
  "help",
  "account",
  "about",
] as const;

type SettingsSlug = (typeof VALID_SLUGS)[number];

function isValidSlug(slug: string): slug is SettingsSlug {
  return (VALID_SLUGS as readonly string[]).includes(slug);
}

export default function SettingsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!isValidSlug(params.slug)) notFound();
  return <SettingsDetail slug={params.slug} />;
}

function SettingsDetail({ slug }: { slug: SettingsSlug }) {
  const t = useT();
  const { prefs, update, addToList, removeFromList, addWord, removeWord } =
    useSettings();
  const { user, profile } = useAuth();
  const { locale, setLocale } = useI18n();
  const { openSettings: openCookies } = useCookieConsent();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [friendOpen, setFriendOpen] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [permStatus, setPermStatus] = useState({
    notifications: "default" as NotificationPermission | "unsupported",
    geolocation: "prompt" as PermissionState | "unsupported",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPermStatus((p) => ({
      ...p,
      notifications:
        "Notification" in window ? Notification.permission : "unsupported",
    }));
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((r) => setPermStatus((prev) => ({ ...prev, geolocation: r.state })))
      .catch(() => {});
  }, []);

  const titles: Record<SettingsSlug, string> = {
    notifications: t("settingsNotifications"),
    time: t("settingsTimeManagement"),
    privacy: t("settingsAccountPrivacy"),
    "close-friends": t("settingsCloseFriends"),
    blocked: t("settingsBlocked"),
    comments: t("settingsComments"),
    messages: t("settingsMessages"),
    tags: t("settingsTagsMentions"),
    sharing: t("settingsSharing"),
    restricted: t("settingsRestricted"),
    "limit-interactions": t("settingsLimitInteractions"),
    "hidden-words": t("settingsHiddenWords"),
    friends: t("settingsFollowInvite"),
    muted: t("settingsMutedAccounts"),
    content: t("settingsContentPreferences"),
    "like-counts": t("settingsLikeShareCounts"),
    permissions: t("settingsDevicePermissions"),
    archive: t("settingsArchiveDownload"),
    accessibility: t("settingsAccessibility"),
    language: t("settingsLanguage"),
    "media-quality": t("settingsMediaQuality"),
    theme: t("theme"),
    help: t("settingsHelp"),
    account: t("settingsAccountStatus"),
    about: t("settingsAbout"),
  };

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermStatus((p) => ({ ...p, notifications: result }));
  }

  function renderBody() {
    switch (slug) {
      case "notifications":
        return (
          <>
            <SettingsInfoBlock>{t("settingsNotificationsDesc")}</SettingsInfoBlock>
            <SettingsSection>
              <SettingsToggleRow
                label={t("settingsNotifyLikes")}
                checked={prefs.notifyLikes}
                onChange={(v) => update({ notifyLikes: v })}
              />
              <SettingsToggleRow
                label={t("settingsNotifyComments")}
                checked={prefs.notifyComments}
                onChange={(v) => update({ notifyComments: v })}
              />
              <SettingsToggleRow
                label={t("settingsNotifyReposts")}
                checked={prefs.notifyReposts}
                onChange={(v) => update({ notifyReposts: v })}
              />
              <SettingsToggleRow
                label={t("settingsNotifyMessages")}
                checked={prefs.notifyMessages}
                onChange={(v) => update({ notifyMessages: v })}
              />
              <SettingsToggleRow
                label={t("settingsNotifyFollows")}
                checked={prefs.notifyFollows}
                onChange={(v) => update({ notifyFollows: v })}
              />
              <SettingsToggleRow
                label={t("settingsNotifyEvents")}
                checked={prefs.notifyEvents}
                onChange={(v) => update({ notifyEvents: v })}
              />
            </SettingsSection>
            <div className="px-4 py-4">
              <button
                type="button"
                onClick={requestNotifications}
                className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold transition hover:bg-surface-card"
              >
                {t("settingsEnablePush")}
              </button>
              <p className="mt-2 text-center text-xs text-muted">
                {t("settingsPushStatus")}:{" "}
                {permStatus.notifications === "unsupported"
                  ? t("settingsUnsupported")
                  : permStatus.notifications}
              </p>
            </div>
          </>
        );

      case "time":
        return (
          <>
            <SettingsInfoBlock>{t("settingsTimeDesc")}</SettingsInfoBlock>
            <SettingsSection>
              <SettingsToggleRow
                label={t("settingsDailyLimit")}
                checked={prefs.timeLimitEnabled}
                onChange={(v) => update({ timeLimitEnabled: v })}
              />
            </SettingsSection>
            <div className="px-4 py-4">
              <label className="block text-sm text-muted">
                {t("settingsMinutesPerDay")}
              </label>
              <input
                type="range"
                min={15}
                max={180}
                step={15}
                value={prefs.dailyTimeLimitMinutes}
                onChange={(e) =>
                  update({ dailyTimeLimitMinutes: Number(e.target.value) })
                }
                className="mt-2 w-full accent-gold"
              />
              <p className="mt-1 text-center text-sm font-semibold">
                {prefs.dailyTimeLimitMinutes} {t("settingsMinutes")}
              </p>
            </div>
          </>
        );

      case "privacy":
        return (
          <>
            <SettingsInfoBlock>{t("settingsPrivacyDesc")}</SettingsInfoBlock>
            <SettingsSection>
              <SettingsChoiceRow
                label={t("settingsPublic")}
                selected
                onSelect={() => {}}
              />
            </SettingsSection>
            <SettingsInfoBlock>{t("settingsPrivacyNote")}</SettingsInfoBlock>
          </>
        );

      case "close-friends":
        return (
          <>
            <SettingsInfoBlock>{t("settingsCloseFriendsDesc")}</SettingsInfoBlock>
            <SettingsUserSearch
              placeholder={t("searchName")}
              onAdd={(uid, userName) =>
                addToList("closeFriends", { uid, userName })
              }
            />
            <SettingsUserList
              users={prefs.closeFriends}
              emptyLabel={t("settingsNoCloseFriends")}
              onRemove={(uid) => removeFromList("closeFriends", uid)}
            />
          </>
        );

      case "blocked":
        return (
          <>
            <SettingsInfoBlock>{t("settingsBlockedDesc")}</SettingsInfoBlock>
            <SettingsUserSearch
              placeholder={t("searchName")}
              onAdd={(uid, userName) =>
                addToList("blockedUsers", { uid, userName })
              }
            />
            <SettingsUserList
              users={prefs.blockedUsers}
              emptyLabel={t("settingsNoBlocked")}
              onRemove={(uid) => removeFromList("blockedUsers", uid)}
            />
          </>
        );

      case "comments":
        return (
          <>
            <SettingsInfoBlock>{t("settingsCommentsDesc")}</SettingsInfoBlock>
            <SettingsSection>
              {(
                [
                  ["everyone", t("settingsEveryone")],
                  ["followers", t("settingsFollowersOnly")],
                  ["off", t("settingsOff")],
                ] as const
              ).map(([value, label]) => (
                <SettingsChoiceRow
                  key={value}
                  label={label}
                  selected={prefs.allowComments === value}
                  onSelect={() =>
                    update({
                      allowComments: value as AppPreferences["allowComments"],
                    })
                  }
                />
              ))}
            </SettingsSection>
          </>
        );

      case "messages":
        return (
          <>
            <SettingsInfoBlock>{t("settingsMessagesDesc")}</SettingsInfoBlock>
            <SettingsSection>
              {(
                [
                  ["everyone", t("settingsEveryone")],
                  ["followers", t("settingsFollowersOnly")],
                  ["off", t("settingsOff")],
                ] as const
              ).map(([value, label]) => (
                <SettingsChoiceRow
                  key={value}
                  label={label}
                  selected={prefs.allowMessages === value}
                  onSelect={() => {
                    update({
                      allowMessages: value as AppPreferences["allowMessages"],
                    });
                    if (user) {
                      updateUserMessagePrivacy(
                        user.uid,
                        value as AppPreferences["allowMessages"],
                      ).catch(() => {});
                    }
                  }}
                />
              ))}
              <SettingsToggleRow
                label={t("settingsMessageReadReceipts")}
                description={t("settingsMessageReadReceiptsDesc")}
                checked={prefs.messageReadReceipts}
                onChange={(v) => update({ messageReadReceipts: v })}
              />
            </SettingsSection>
            <SettingsInfoBlock>{t("settingsMessagesFoldersDesc")}</SettingsInfoBlock>
            <SettingsSection>
              <Link
                href="/messages?filter=hidden"
                className="block px-4 py-3.5 text-[15px] transition hover:bg-surface-overlay/60"
              >
                {t("messagesFilterHidden")} →
              </Link>
              <Link
                href="/messages?filter=spam"
                className="block px-4 py-3.5 text-[15px] transition hover:bg-surface-overlay/60"
              >
                {t("messagesFilterSpam")} →
              </Link>
            </SettingsSection>
            <SettingsInfoBlock>{t("settingsSpamUsersDesc")}</SettingsInfoBlock>
            <SettingsUserList
              users={prefs.spamUsers}
              emptyLabel={t("settingsNoSpamUsers")}
              onRemove={(uid) => removeFromList("spamUsers", uid)}
            />
          </>
        );

      case "tags":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsAllowTags")}
              description={t("settingsAllowTagsDesc")}
              checked={prefs.allowTags}
              onChange={(v) => update({ allowTags: v })}
            />
            <SettingsToggleRow
              label={t("settingsAllowMentions")}
              description={t("settingsAllowMentionsDesc")}
              checked={prefs.allowMentions}
              onChange={(v) => update({ allowMentions: v })}
            />
          </SettingsSection>
        );

      case "sharing":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsAllowSharing")}
              description={t("settingsAllowSharingDesc")}
              checked={prefs.allowSharing}
              onChange={(v) => update({ allowSharing: v })}
            />
          </SettingsSection>
        );

      case "restricted":
        return (
          <>
            <SettingsInfoBlock>{t("settingsRestrictedDesc")}</SettingsInfoBlock>
            <SettingsUserSearch
              placeholder={t("searchName")}
              onAdd={(uid, userName) =>
                addToList("restrictedUsers", { uid, userName })
              }
            />
            <SettingsUserList
              users={prefs.restrictedUsers}
              emptyLabel={t("settingsNoRestricted")}
              onRemove={(uid) => removeFromList("restrictedUsers", uid)}
            />
          </>
        );

      case "limit-interactions":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsLimitInteractions")}
              description={t("settingsLimitInteractionsDesc")}
              checked={prefs.limitInteractions}
              onChange={(v) => update({ limitInteractions: v })}
            />
          </SettingsSection>
        );

      case "hidden-words":
        return (
          <>
            <SettingsInfoBlock>{t("settingsHiddenWordsDesc")}</SettingsInfoBlock>
            <div className="flex gap-2 px-4 py-3">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={t("settingsAddWord")}
                className="flex-1 rounded-xl border border-border bg-surface-overlay px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => {
                  addWord(newWord);
                  setNewWord("");
                }}
                className="rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-black"
              >
                +
              </button>
            </div>
            <SettingsSection>
              {prefs.hiddenWords.length === 0 ? (
                <SettingsInfoBlock>{t("settingsNoHiddenWords")}</SettingsInfoBlock>
              ) : (
                prefs.hiddenWords.map((word) => (
                  <div
                    key={word}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => removeWord(word)}
                      className="text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </SettingsSection>
          </>
        );

      case "friends":
        return (
          <>
            <SettingsInfoBlock>{t("settingsFriendsDesc")}</SettingsInfoBlock>
            <div className="px-4 py-4">
              <button
                type="button"
                onClick={() => setFriendOpen(true)}
                className="w-full rounded-xl bg-vibe py-3 text-sm font-bold text-background"
              >
                {t("addFriend")}
              </button>
            </div>
            <FriendManageModal
              open={friendOpen}
              onClose={() => setFriendOpen(false)}
              onChanged={() => {}}
            />
          </>
        );

      case "muted":
        return (
          <>
            <SettingsInfoBlock>{t("settingsMutedDesc")}</SettingsInfoBlock>
            <SettingsUserSearch
              placeholder={t("searchName")}
              onAdd={(uid, userName) =>
                addToList("mutedUsers", { uid, userName })
              }
            />
            <SettingsUserList
              users={prefs.mutedUsers}
              emptyLabel={t("settingsNoMuted")}
              onRemove={(uid) => removeFromList("mutedUsers", uid)}
            />
          </>
        );

      case "content":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsSensitiveContent")}
              description={t("settingsSensitiveContentDesc")}
              checked={!prefs.limitInteractions}
              onChange={(v) => update({ limitInteractions: !v })}
            />
            <SettingsToggleRow
              label={t("settingsAutoplayVideos")}
              description={t("settingsAutoplayVideosDesc")}
              checked={prefs.mediaQuality !== "low"}
              onChange={(v) =>
                update({ mediaQuality: v ? "auto" : "low" })
              }
            />
          </SettingsSection>
        );

      case "like-counts":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsHideLikeCounts")}
              description={t("settingsHideLikeCountsDesc")}
              checked={prefs.hideLikeCounts}
              onChange={(v) => update({ hideLikeCounts: v })}
            />
            <SettingsToggleRow
              label={t("settingsHideShareCounts")}
              description={t("settingsHideShareCountsDesc")}
              checked={prefs.hideShareCounts}
              onChange={(v) => update({ hideShareCounts: v })}
            />
          </SettingsSection>
        );

      case "permissions":
        return (
          <>
            <SettingsInfoBlock>{t("settingsPermissionsDesc")}</SettingsInfoBlock>
            <SettingsSection>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-[15px]">{t("settingsNotifications")}</span>
                <span className="text-sm text-muted">
                  {permStatus.notifications}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-[15px]">{t("location")}</span>
                <span className="text-sm text-muted">
                  {permStatus.geolocation}
                </span>
              </div>
            </SettingsSection>
            <div className="space-y-2 px-4 py-4">
              <button
                type="button"
                onClick={requestNotifications}
                className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold"
              >
                {t("settingsRequestNotifications")}
              </button>
              <button
                type="button"
                onClick={() => navigator.geolocation.getCurrentPosition(() => {})}
                className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold"
              >
                {t("settingsRequestLocation")}
              </button>
              <button
                type="button"
                onClick={openCookies}
                className="w-full rounded-xl bg-surface-overlay py-3 text-sm font-semibold"
              >
                {t("cookieSettings")}
              </button>
            </div>
          </>
        );

      case "archive":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsAutoArchive")}
              description={t("settingsAutoArchiveDesc")}
              checked={prefs.autoArchive}
              onChange={(v) => update({ autoArchive: v })}
            />
            <Link
              href="/favorites"
              className="block px-4 py-3.5 text-[15px] text-vibe transition hover:bg-surface-overlay/60"
            >
              {t("settingsViewSaved")} →
            </Link>
          </SettingsSection>
        );

      case "accessibility":
        return (
          <SettingsSection>
            <SettingsToggleRow
              label={t("settingsReduceMotion")}
              description={t("settingsReduceMotionDesc")}
              checked={prefs.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />
            <SettingsToggleRow
              label={t("settingsLargeText")}
              description={t("settingsLargeTextDesc")}
              checked={prefs.textSize === "large"}
              onChange={(v) =>
                update({ textSize: v ? "large" : "normal" })
              }
            />
          </SettingsSection>
        );

      case "language":
        return (
          <SettingsSection>
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((code) => (
              <SettingsChoiceRow
                key={code}
                label={LOCALE_LABELS[code]}
                selected={locale === code}
                onSelect={() => setLocale(code)}
              />
            ))}
          </SettingsSection>
        );

      case "media-quality":
        return (
          <>
            <SettingsInfoBlock>{t("settingsMediaQualityDesc")}</SettingsInfoBlock>
            <SettingsSection>
              {(
                [
                  ["auto", t("settingsAuto")],
                  ["high", t("settingsHigh")],
                  ["low", t("settingsLow")],
                ] as const
              ).map(([value, label]) => (
                <SettingsChoiceRow
                  key={value}
                  label={label}
                  selected={prefs.mediaQuality === value}
                  onSelect={() =>
                    update({
                      mediaQuality: value as AppPreferences["mediaQuality"],
                    })
                  }
                />
              ))}
            </SettingsSection>
          </>
        );

      case "theme":
        if (!mounted) return null;
        return (
          <SettingsSection>
            {(
              [
                ["system", t("themeSystem")],
                ["light", t("themeLight")],
                ["dark", t("themeDark")],
              ] as const
            ).map(([value, label]) => (
              <SettingsChoiceRow
                key={value}
                label={label}
                selected={theme === value}
                onSelect={() => setTheme(value)}
              />
            ))}
          </SettingsSection>
        );

      case "help":
        return (
          <SettingsSection>
            <Link
              href="/privacy-policy"
              className="block px-4 py-3.5 text-[15px] transition hover:bg-surface-overlay/60"
            >
              {t("privacyPolicy")} ›
            </Link>
            <Link
              href="/terms-of-service"
              className="block px-4 py-3.5 text-[15px] transition hover:bg-surface-overlay/60"
            >
              {t("termsOfService")} ›
            </Link>
            <Link
              href="/cookie-policy"
              className="block px-4 py-3.5 text-[15px] transition hover:bg-surface-overlay/60"
            >
              {t("cookiePolicy")} ›
            </Link>
            <button
              type="button"
              onClick={openCookies}
              className="block w-full px-4 py-3.5 text-left text-[15px] transition hover:bg-surface-overlay/60"
            >
              {t("cookieSettings")} ›
            </button>
          </SettingsSection>
        );

      case "account":
        return (
          <>
            <SettingsSection>
              <div className="px-4 py-3.5">
                <p className="text-xs text-muted">{t("userNameLabel")}</p>
                <p className="text-[15px]">
                  @{profile?.userName ?? user?.displayName ?? "user"}
                </p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-xs text-muted">Email</p>
                <p className="text-[15px]">{user?.email ?? "—"}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-xs text-muted">{t("roleLabel")}</p>
                <p className="text-[15px]">{profile?.role ?? t("roleHotelGuest")}</p>
              </div>
            </SettingsSection>
            <div className="px-4 py-4">
              <Link
                href="/profile/edit"
                className="block w-full rounded-xl bg-surface-overlay py-3 text-center text-sm font-semibold"
              >
                {t("editProfile")}
              </Link>
            </div>
            <PrivacyDataPanel />
          </>
        );

      case "about":
        return (
          <>
            <SettingsSection>
              <div className="px-4 py-3.5">
                <p className="font-display text-lg font-bold">{BRAND_NAME}</p>
                <p className="mt-1 text-sm text-muted">v1.0.0</p>
              </div>
            </SettingsSection>
            <SettingsInfoBlock>{t("settingsAboutDesc")}</SettingsInfoBlock>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <SettingsScreen title={titles[slug]}>
      {renderBody()}
    </SettingsScreen>
  );
}
