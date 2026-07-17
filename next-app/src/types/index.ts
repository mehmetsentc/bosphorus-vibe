/** Mevcut BosphorusVibe Firebase şeması — Flutter uygulamasıyla uyumlu */

export type MessagePrivacy = "everyone" | "followers" | "off";

/** Application RBAC — stored in Firestore users.role */
export type AppRole = "user" | "admin";

export type EventCategory = string;

export interface UserDoc {
  uid: string;
  display_name: string;
  userName: string;
  email: string;
  photo_url: string;
  bio: string;
  role: string;
  title: string;
  /** Firebase anonymous guest sessions — hidden from public member lists */
  isAnonymous?: boolean;
  created_time: Date;
  last_active_time?: Date;
  total_activity_participants?: number;
  /** Who can send this user direct messages */
  allow_messages?: MessagePrivacy;
}

export type PostTag = {
  uid: string;
  userName: string;
  displayName?: string;
};

export interface UserPostDoc {
  id: string;
  postPhoto?: string;
  /** Low-quality compressed image (used in feed / grid) */
  postPhotoURL?: string;
  postPhotoURL_original?: string;
  postPhotoURL_low?: string;
  postTitle?: string;
  postDescription?: string;
  /** AI tarafından üretilen çok dilli açıklamalar: { tr: "...", en: "...", ru: "..." } */
  postDescriptions?: Record<string, string>;
  postUserId?: string;
  postVideo?: string;
  postVideoURL?: string;
  postVideoURL_original?: string;
  postVideoURL_low?: string;
  /** Standardized fast-playback tier (client or server preview.mp4) */
  postVideoURL_preview?: string;
  /** Server-encoded 480p tier (users/{uid}/videos/{postId}/medium.mp4) */
  postVideoURL_medium?: string;
  /** Optional HLS manifest when adaptive streaming is enabled */
  postVideoURL_hls?: string;
  /** Server-encoded 1080p tier (users/{uid}/videos/{postId}/high.mp4) */
  postVideoURL_high?: string;
  postVideothumbnail?: string;
  /** Cloud Function transcode queue state for low.mp4 generation */
  videoTranscodeStatus?: "pending" | "processing" | "done" | "failed" | "skipped";
  /** Indexed flag for video-only queries (set on create). */
  hasVideo?: boolean;
  /** Optional stored dimensions for layout estimates. */
  videoWidth?: number;
  videoHeight?: number;
  timePosted: Date;
  numComments: number;
  numViews?: number;
  likedByIds: string[];
  savedByIds: string[];
  category?: string;
  activityName?: string;
  eventId?: string;
  taggedPeople?: PostTag[];
}

export interface PostCommentDoc {
  id: string;
  comment: string;
  userId?: string;
  userName?: string;
  userPhoto?: string;
  timePosted: Date;
}

export interface EventDoc {
  id: string;
  /** Firestore `id` field — daily sports sort order */
  eventSortId: number;
  eventName: string;
  eventTimeLabel: string;
  eventDate: Date;
  eventCategory: string;
  eventLocation: string;
  eventImage: string;
  eventDescription: string;
  isHighlight: boolean;
  view: number;
  /** Weekly events: JS day numbers (0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat) */
  eventDays?: number[];
  /** Weekly sport events (true) vs weekly show/entertainment events (false/undefined) */
  isSport?: boolean;
  /** Duration in minutes; defaults to 30. Use for events that span midnight (e.g. 150 = 2.5h). */
  eventDurationMinutes?: number;
  /** Human-readable duration label shown on timeline cards (e.g. "45 dakika boyunca devam ediyor") */
  durationLabel?: string;
}

export interface TeamMemberDoc {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  title: string;
  isActiveToday: boolean;
}

export type NotificationType = "like" | "comment" | "repost" | "message" | "follow";

export interface NotificationDoc {
  id: string;
  is_read: boolean;
  notification_text: string;
  type: NotificationType | string;
  time: Date;
  made_by_id?: string;
  made_to_id?: string;
  post_id?: string;
  comment_id?: string;
  chat_id?: string;
  actor_name?: string;
  actor_photo?: string;
}

export interface StoryHighlightDoc {
  id: string;
  userId: string;
  title: string;
  coverUrl: string;
  storyIds: string[];
  sortOrder: number;
  createdAt: Date;
}

export type StoryCategory = "vibe" | "reels" | "events";

export interface StoryDoc {
  id: string;
  userId: string;
  storyPhoto?: string;
  storyVideo?: string;
  storyVideo_low?: string;
  videoUrl?: string;
  videoUrl_low?: string;
  storyDescription?: string;
  storyCategory?: StoryCategory;
  eventId?: string;
  storyPostedAt: Date;
  expiredAt?: Date;
  isExpired: boolean;
  viewedByIds: string[];
  numComments: number;
  taggedPeople?: PostTag[];
}

export type StoryUserGroup = {
  userId: string;
  userName: string;
  userPhoto: string;
  stories: StoryDoc[];
  hasUnviewed: boolean;
  latestAt: Date;
};

export interface ChatDoc {
  id: string;
  userIds: string[];
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSeenByIds: string[];
  lastMessageSentById?: string;
  groupChatId?: number;
  /** User ids who hid this chat from their inbox */
  hiddenByIds?: string[];
  /** User ids who deleted this chat from their list */
  deletedByIds?: string[];
  /** User ids who marked this chat as spam */
  spamByIds?: string[];
}

export interface ChatMessageDoc {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  image?: string;
  video?: string;
  timestamp: Date;
}

export const COLLECTIONS = {
  users: "users",
  userPosts: "userPosts",
  eventListPortyApp: "eventListPortyApp",
  userStories: "userStories",
  storyHighlights: "storyHighlights",
  postComments: "postComments",
  friends: "friends",
  notification: "Notification",
  chats: "chats",
  chatMessages: "chat_messages",
} as const;

/** Canonical + legacy English role values used in Firestore team queries. */
export const TEAM_ROLES = [
  "Animation Team",
  "Porty Club Animation Team",
] as const;
