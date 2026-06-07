"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { useSettings } from "@/components/settings/SettingsProvider";
import {
  SiAccessibility,
  SiActivity,
  SiArchive,
  SiAt,
  SiBell,
  SiBlock,
  SiClock,
  SiComment,
  SiDownload,
  SiFavorites,
  SiFriends,
  SiHeartOff,
  SiHelp,
  SiInfo,
  SiLanguage,
  SiLimit,
  SiLock,
  SiLogout,
  SiMessage,
  SiMute,
  SiPhone,
  SiPlay,
  SiQuality,
  SiRestrict,
  SiShare,
  SiShield,
  SiStar,
  SiTheme,
  SiUser,
  SiWeb,
  SiWords,
} from "@/components/settings/SettingsIcons";
import {
  SettingsRow,
  SettingsScreen,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n, useT } from "@/components/providers/I18nProvider";
import { signOutUser } from "@/lib/services/auth";
import { LOCALE_LABELS } from "@/i18n/locale-labels";

export default function SettingsPage() {
  const t = useT();
  const { locale } = useI18n();
  const { prefs } = useSettings();
  const { openSettings: openCookieSettings } = useCookieConsent();
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await signOutUser();
    router.replace("/welcome");
  }

  const commentLabel =
    prefs.allowComments === "off"
      ? t("settingsOff")
      : prefs.allowComments === "followers"
        ? t("settingsFollowersOnly")
        : t("settingsEveryone");

  const messagesLabel =
    prefs.allowMessages === "off"
      ? t("settingsOff")
      : prefs.allowMessages === "followers"
        ? t("settingsFollowersOnly")
        : t("settingsEveryone");

  return (
    <SettingsScreen title={t("settingsTitle")} backHref="/profile">
      <SettingsSection>
        <SettingsRow
          icon={<SiArchive size={22} />}
          label={t("settingsArchive")}
          href="/favorites"
        />
        <SettingsRow
          icon={<SiActivity size={22} />}
          label={t("settingsYourActivity")}
          href="/favorites"
        />
        <SettingsRow
          icon={<SiBell size={22} />}
          label={t("settingsNotifications")}
          href="/profile/settings/notifications"
        />
        <SettingsRow
          icon={<SiClock size={22} />}
          label={t("settingsTimeManagement")}
          href="/profile/settings/time"
          value={prefs.timeLimitEnabled ? t("settingsOn") : t("settingsOff")}
        />
      </SettingsSection>

      <SettingsSection title={t("settingsWhoSeesContent")}>
        <SettingsRow
          icon={<SiLock size={22} />}
          label={t("settingsAccountPrivacy")}
          href="/profile/settings/privacy"
          value={t("settingsPublic")}
        />
        <SettingsRow
          icon={<SiStar size={22} />}
          label={t("settingsCloseFriends")}
          href="/profile/settings/close-friends"
          value={String(prefs.closeFriends.length)}
        />
        <SettingsRow
          icon={<SiBlock size={22} />}
          label={t("settingsBlocked")}
          href="/profile/settings/blocked"
          value={String(prefs.blockedUsers.length)}
        />
      </SettingsSection>

      <SettingsSection title={t("settingsInteractions")}>
        <SettingsRow
          icon={<SiMessage size={22} />}
          label={t("settingsMessages")}
          href="/profile/settings/messages"
          value={messagesLabel}
        />
        <SettingsRow
          icon={<SiComment size={22} />}
          label={t("settingsComments")}
          href="/profile/settings/comments"
          value={commentLabel}
        />
        <SettingsRow
          icon={<SiAt size={22} />}
          label={t("settingsTagsMentions")}
          href="/profile/settings/tags"
        />
        <SettingsRow
          icon={<SiShare size={22} />}
          label={t("settingsSharing")}
          href="/profile/settings/sharing"
          value={prefs.allowSharing ? t("settingsOn") : t("settingsOff")}
        />
        <SettingsRow
          icon={<SiRestrict size={22} />}
          label={t("settingsRestricted")}
          href="/profile/settings/restricted"
          value={String(prefs.restrictedUsers.length)}
        />
        <SettingsRow
          icon={<SiLimit size={22} />}
          label={t("settingsLimitInteractions")}
          href="/profile/settings/limit-interactions"
          value={prefs.limitInteractions ? t("settingsOn") : t("settingsOff")}
        />
        <SettingsRow
          icon={<SiWords size={22} />}
          label={t("settingsHiddenWords")}
          href="/profile/settings/hidden-words"
          value={String(prefs.hiddenWords.length)}
        />
        <SettingsRow
          icon={<SiFriends size={22} />}
          label={t("settingsFollowInvite")}
          href="/profile/settings/friends"
        />
      </SettingsSection>

      <SettingsSection title={t("settingsWhatYouSee")}>
        <SettingsRow
          icon={<SiFavorites size={22} />}
          label={t("favoritesTitle")}
          href="/favorites"
        />
        <SettingsRow
          icon={<SiMute size={22} />}
          label={t("settingsMutedAccounts")}
          href="/profile/settings/muted"
          value={String(prefs.mutedUsers.length)}
        />
        <SettingsRow
          icon={<SiPlay size={22} />}
          label={t("settingsContentPreferences")}
          href="/profile/settings/content"
        />
        <SettingsRow
          icon={<SiHeartOff size={22} />}
          label={t("settingsLikeShareCounts")}
          href="/profile/settings/like-counts"
          value={prefs.hideLikeCounts ? t("settingsHidden") : t("settingsShown")}
        />
      </SettingsSection>

      <SettingsSection title={t("settingsAppMedia")}>
        <SettingsRow
          icon={<SiPhone size={22} />}
          label={t("settingsDevicePermissions")}
          href="/profile/settings/permissions"
        />
        <SettingsRow
          icon={<SiDownload size={22} />}
          label={t("settingsArchiveDownload")}
          href="/profile/settings/archive"
          value={prefs.autoArchive ? t("settingsOn") : t("settingsOff")}
        />
        <SettingsRow
          icon={<SiAccessibility size={22} />}
          label={t("settingsAccessibility")}
          href="/profile/settings/accessibility"
        />
        <SettingsRow
          icon={<SiLanguage size={22} />}
          label={t("settingsLanguage")}
          href="/profile/settings/language"
          value={LOCALE_LABELS[locale]}
        />
        <SettingsRow
          icon={<SiQuality size={22} />}
          label={t("settingsMediaQuality")}
          href="/profile/settings/media-quality"
          value={
            prefs.mediaQuality === "auto"
              ? t("settingsAuto")
              : prefs.mediaQuality === "high"
                ? t("settingsHigh")
                : t("settingsLow")
          }
        />
        <SettingsRow
          icon={<SiTheme size={22} />}
          label={t("theme")}
          href="/profile/settings/theme"
        />
        <SettingsRow
          icon={<SiWeb size={22} />}
          label={t("settingsWebsitePermissions")}
          onClick={openCookieSettings}
        />
      </SettingsSection>

      <SettingsSection title={t("settingsMoreSupport")}>
        <SettingsRow
          icon={<SiHelp size={22} />}
          label={t("settingsHelp")}
          href="/profile/settings/help"
        />
        <SettingsRow
          icon={<SiShield size={22} />}
          label={t("settingsPrivacyCenter")}
          href="/privacy-policy"
        />
        <SettingsRow
          icon={<SiUser size={22} />}
          label={t("settingsAccountStatus")}
          href="/profile/settings/account"
        />
        <SettingsRow
          icon={<SiInfo size={22} />}
          label={t("settingsAbout")}
          href="/profile/settings/about"
        />
      </SettingsSection>

      <SettingsSection title={t("settingsAccount")}>
        <SettingsRow
          icon={<SiUser size={22} />}
          label={user?.email ?? t("user")}
          href="/profile/edit"
        />
        <SettingsRow
          icon={<SiLogout size={22} />}
          label={t("logout")}
          onClick={handleLogout}
          destructive
        />
      </SettingsSection>

      <p className="px-4 py-6 text-center text-xs text-muted">
        <Link href="/terms-of-service" className="hover:text-foreground">
          {t("termsOfService")}
        </Link>
        {" · "}
        <Link href="/cookie-policy" className="hover:text-foreground">
          {t("cookiePolicy")}
        </Link>
      </p>
    </SettingsScreen>
  );
}
