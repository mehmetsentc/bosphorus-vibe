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
  postUserId?: string;
  postVideo?: string;
  postVideoURL?: string;
  postVideoURL_original?: string;
  postVideoURL_low?: string;
  postVideothumbnail?: string;
  /** Cloud Function transcode queue state for low.mp4 generation */
  videoTranscodeStatus?: "pending" | "processing" | "done" | "failed" | "skipped";
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

export interface NotificationDoc {
  id: string;
  is_read: boolean;
  notification_text: string;
  type: string;
  time: Date;
  made_by_id?: string;
  made_to_id?: string;
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
  postComments: "postComments",
  friends: "friends",
  notification: "Notification",
  chats: "chats",
  chatMessages: "chat_messages",
} as const;

/** Firebase'deki gerçek role değerleri */
export const TEAM_ROLES = [
  "Animation Team",
  "Porty Club Animation Team",
] as const;
