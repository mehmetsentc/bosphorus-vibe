export type MediaQualityPref = "auto" | "high" | "low";
export type MessagePrivacy = "everyone" | "followers" | "off";

export type UserListEntry = {
  uid: string;
  userName: string;
};

export type AppPreferences = {
  hideLikeCounts: boolean;
  hideShareCounts: boolean;
  allowComments: "everyone" | "followers" | "off";
  allowTags: boolean;
  allowMentions: boolean;
  allowSharing: boolean;
  /** Who can start a direct conversation with you */
  allowMessages: MessagePrivacy;
  /** Show read receipts in chats you participate in */
  messageReadReceipts: boolean;
  limitInteractions: boolean;
  reduceMotion: boolean;
  textSize: "normal" | "large";
  mediaQuality: MediaQualityPref;
  autoArchive: boolean;
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyReposts: boolean;
  notifyMessages: boolean;
  notifyFollows: boolean;
  notifyEvents: boolean;
  dailyTimeLimitMinutes: number;
  timeLimitEnabled: boolean;
  blockedUsers: UserListEntry[];
  mutedUsers: UserListEntry[];
  restrictedUsers: UserListEntry[];
  hiddenWords: string[];
  closeFriends: UserListEntry[];
  /** Users whose chats are marked as unwanted / spam */
  spamUsers: UserListEntry[];
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  hideLikeCounts: false,
  hideShareCounts: false,
  allowComments: "everyone",
  allowTags: true,
  allowMentions: true,
  allowSharing: true,
  allowMessages: "everyone",
  messageReadReceipts: true,
  limitInteractions: false,
  reduceMotion: false,
  textSize: "normal",
  mediaQuality: "auto",
  autoArchive: false,
  notifyLikes: true,
  notifyComments: true,
  notifyReposts: true,
  notifyMessages: true,
  notifyFollows: true,
  notifyEvents: true,
  dailyTimeLimitMinutes: 60,
  timeLimitEnabled: false,
  blockedUsers: [],
  mutedUsers: [],
  restrictedUsers: [],
  hiddenWords: [],
  closeFriends: [],
  spamUsers: [],
};

const STORAGE_KEY = "bv_app_preferences";

function parsePreferences(raw: string | null): AppPreferences {
  if (!raw) return { ...DEFAULT_PREFERENCES };
  try {
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function readPreferences(): AppPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  return parsePreferences(localStorage.getItem(STORAGE_KEY));
}

export function writePreferences(prefs: AppPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function updatePreferences(
  patch: Partial<AppPreferences>,
): AppPreferences {
  const next = { ...readPreferences(), ...patch };
  writePreferences(next);
  return next;
}

export function addUserToList(
  key:
    | "blockedUsers"
    | "mutedUsers"
    | "restrictedUsers"
    | "closeFriends"
    | "spamUsers",
  entry: UserListEntry,
): AppPreferences {
  const prefs = readPreferences();
  const list = prefs[key].filter((u) => u.uid !== entry.uid);
  return updatePreferences({ [key]: [...list, entry] });
}

export function removeUserFromList(
  key:
    | "blockedUsers"
    | "mutedUsers"
    | "restrictedUsers"
    | "closeFriends"
    | "spamUsers",
  uid: string,
): AppPreferences {
  const prefs = readPreferences();
  return updatePreferences({
    [key]: prefs[key].filter((u) => u.uid !== uid),
  });
}

export function addHiddenWord(word: string): AppPreferences {
  const trimmed = word.trim().toLowerCase();
  if (!trimmed) return readPreferences();
  const prefs = readPreferences();
  if (prefs.hiddenWords.includes(trimmed)) return prefs;
  return updatePreferences({
    hiddenWords: [...prefs.hiddenWords, trimmed],
  });
}

export function removeHiddenWord(word: string): AppPreferences {
  const prefs = readPreferences();
  return updatePreferences({
    hiddenWords: prefs.hiddenWords.filter((w) => w !== word),
  });
}

export function containsHiddenWord(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

export function isUserBlocked(uid: string, prefs?: AppPreferences): boolean {
  const p = prefs ?? readPreferences();
  return p.blockedUsers.some((u) => u.uid === uid);
}

export function isUserMuted(uid: string, prefs?: AppPreferences): boolean {
  const p = prefs ?? readPreferences();
  return p.mutedUsers.some((u) => u.uid === uid);
}

export function isUserSpam(uid: string, prefs?: AppPreferences): boolean {
  const p = prefs ?? readPreferences();
  return p.spamUsers.some((u) => u.uid === uid);
}
