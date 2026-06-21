import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { STORAGE_MEDIA_CACHE_CONTROL } from "@/lib/media/video-encode";
import { videoEncodeStatusForUpload } from "@/lib/media/video-encode";
import { compressImage, videoThumbnailFromFile, isImageBlob, createPlaceholderThumbnail } from "@/lib/utils/media-compress";
import { hasPostVideo } from "@/lib/utils/video-sources";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import {
  toDate,
  refToId,
  refsToIds,
  isToday,
  isSunday,
} from "@/lib/utils/firestore-helpers";
import { sortEventsForSuggestions } from "@/lib/utils/event-dates";
import { buildPostTagFields, parseTaggedPeople } from "@/lib/utils/post-tags";
import {
  COLLECTIONS,
  TEAM_ROLES,
  type EventDoc,
  type PostTag,
  type UserPostDoc,
  type TeamMemberDoc,
  type PostCommentDoc,
} from "@/types";

function mapEvent(id: string, data: Record<string, unknown>): EventDoc {
  const eventDate = toDate(data.Event_Date);
  const rawSortId = data.id;
  const eventSortId =
    typeof rawSortId === "number"
      ? rawSortId
      : typeof rawSortId === "string" && rawSortId.trim()
        ? Number(rawSortId)
        : Number.NaN;

  return {
    id,
    eventSortId: Number.isFinite(eventSortId) ? eventSortId : Number.MAX_SAFE_INTEGER,
    eventName: (data.Event_Name as string) ?? "",
    eventTimeLabel: (data.Event_Time as string) ?? formatTimeLabel(eventDate),
    eventDate,
    eventCategory: (data.Category as string) ?? "",
    eventLocation: (data.Event_Location as string) ?? "",
    eventImage: (data.Event_image as string) ?? "",
    eventDescription: (data.aboutEvent as string) ?? "",
    isHighlight: false,
    view: (data.view as number) ?? 0,
  };
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sanitizeMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return undefined;
  return trimmed;
}

function mapPost(id: string, data: Record<string, unknown>): UserPostDoc {
  const likedByIds = refsToIds(data.Post_liked_by ?? data.likedBy);
  const savedByIds = refsToIds(data.post_saved_by);
  return {
    id,
    postPhoto: sanitizeMediaUrl(data.postPhoto),
    postPhotoURL: sanitizeMediaUrl(data.postPhotoURL),
    postTitle: (data.postTitle as string) ?? undefined,
    postDescription: (data.postDescription as string) ?? undefined,
    postUserId: refToId(data.postUser),
    postVideo: sanitizeMediaUrl(data.postVideo),
    postVideoURL: sanitizeMediaUrl(data.postVideoURL),
    postVideoURL_original: sanitizeMediaUrl(data.postVideoURL_original),
    postVideoURL_preview: sanitizeMediaUrl(data.postVideoURL_preview),
    postVideoURL_low: sanitizeMediaUrl(data.postVideoURL_low),
    postVideothumbnail: sanitizeMediaUrl(data.postVideothumbnail),
    timePosted: toDate(data.timePosted ?? data.createdAt),
    numComments: (data.numComments as number) ?? 0,
    numViews: (data.numViews as number) ?? 0,
    likedByIds,
    savedByIds,
    category: (data.category as string) ?? undefined,
    activityName: (data.Activity_Name as string) ?? undefined,
    eventId: (data.event_id as string) ?? undefined,
    taggedPeople: parseTaggedPeople(data.tagged_people),
  };
}

export function getPostImageUrl(post: UserPostDoc): string {
  return post.postPhotoURL || post.postPhoto || "";
}

export function getPostVideoUrl(post: UserPostDoc): string {
  return (
    post.postVideoURL_original ||
    post.postVideo ||
    post.postVideoURL ||
    post.postVideoURL_low ||
    ""
  );
}

export { hasPostVideo } from "@/lib/utils/video-sources";

export function getPostCaption(post: UserPostDoc): string {
  return (
    post.postDescription ||
    post.postTitle ||
    post.activityName ||
    ""
  );
}

export function hasPostMedia(post: UserPostDoc): boolean {
  return Boolean(getPostImageUrl(post) || getPostVideoUrl(post));
}

export type PostsPage = {
  posts: UserPostDoc[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

/** Paginated feed — photo and video posts, cursor-based infinite scroll. */
export async function getFeedPostsPage(
  pageSize = 10,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<PostsPage> {
  const batchSize = 20;
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  const collected: UserPostDoc[] = [];
  let hasMore = true;
  let pageCursor: QueryDocumentSnapshot<DocumentData> | null = cursor ?? null;

  while (collected.length < pageSize && hasMore) {
    const constraints: QueryConstraint[] = [
      orderBy("timePosted", "desc"),
      limit(batchSize),
    ];
    if (pageCursor) {
      constraints.push(startAfter(pageCursor));
    }

    const snap = await getDocs(
      query(collection(getFirebaseDb(), COLLECTIONS.userPosts), ...constraints),
    );

    if (snap.empty) {
      hasMore = false;
      break;
    }

    for (const d of snap.docs) {
      lastDoc = d;
      const post = mapPost(d.id, d.data());
      if (hasPostMedia(post)) collected.push(post);
      if (collected.length >= pageSize) break;
    }

    hasMore = snap.docs.length === batchSize;
    pageCursor = null;
  }

  return {
    posts: collected,
    lastDoc,
    hasMore,
  };
}

export async function getPostById(id: string): Promise<UserPostDoc | null> {
  const snap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.userPosts, id));
  if (!snap.exists()) return null;
  return mapPost(snap.id, snap.data());
}

export async function getPostsByEventId(eventId: string): Promise<UserPostDoc[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userPosts),
      where("event_id", "==", eventId),
      limit(100),
    ),
  );
  return snap.docs
    .map((d) => mapPost(d.id, d.data()))
    .filter(hasPostMedia)
    .sort((a, b) => b.timePosted.getTime() - a.timePosted.getTime());
}

export async function getAllEvents(): Promise<EventDoc[]> {
  const snap = await getDocs(
    collection(getFirebaseDb(), COLLECTIONS.eventListPortyApp),
  );
  return snap.docs
    .map((d) => mapEvent(d.id, d.data()))
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

export async function getEventById(id: string): Promise<EventDoc | null> {
  const snap = await getDoc(
    doc(getFirebaseDb(), COLLECTIONS.eventListPortyApp, id),
  );
  if (!snap.exists()) return null;
  return mapEvent(snap.id, snap.data());
}

export async function getEventCategories(): Promise<string[]> {
  const events = await getAllEvents();
  const cats = new Set<string>();
  for (const e of events) {
    if (e.eventCategory.trim()) cats.add(e.eventCategory);
  }
  return Array.from(cats).sort();
}

export async function getEvents(category?: string): Promise<EventDoc[]> {
  const all = await getAllEvents();
  if (!category || category === "all") return all;
  return all.filter((e) => e.eventCategory === category);
}

export async function getEventsByCategoryFilter(
  filter: string,
): Promise<EventDoc[]> {
  return getEvents(filter);
}

function sortDailyById(events: EventDoc[]): EventDoc[] {
  return [...events].sort((a, b) => a.eventSortId - b.eventSortId);
}

function isUpcomingShow(event: EventDoc): boolean {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return event.eventDate.getTime() >= startOfToday.getTime();
}

/** daily + SHOW TIME — daily by id, show time by date */
export async function getEventsBySections(): Promise<{
  daily: EventDoc[];
  showTime: EventDoc[];
}> {
  const all = await getAllEvents();

  const daily = sortDailyById(
    all.filter((e) => e.eventCategory.trim().toLowerCase() === "daily"),
  );

  const showTime = all
    .filter((e) => e.eventCategory.trim().toLowerCase() === "show time")
    .filter(isUpcomingShow)
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  return { daily, showTime };
}

export async function getUpcomingEventSuggestions(
  limit = 8,
): Promise<EventDoc[]> {
  const { daily, showTime } = await getEventsBySections();
  const pool = [...showTime, ...daily];
  return sortEventsForSuggestions(pool).slice(0, limit);
}

export async function getTodayEvents(): Promise<EventDoc[]> {
  const all = await getAllEvents();
  const dailyToday = isSunday()
    ? []
    : sortDailyById(
        all.filter((e) => e.eventCategory.trim().toLowerCase() === "daily"),
      );
  const datedToday = all
    .filter(
      (e) =>
        e.eventCategory.trim().toLowerCase() !== "daily" &&
        isToday(e.eventDate),
    )
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  return [...dailyToday, ...datedToday];
}

export async function getHighlightEvent(): Promise<EventDoc | null> {
  const today = await getTodayEvents();
  const pool = today.length ? today : await getAllEvents();
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => b.view - a.view);
  return { ...sorted[0], isHighlight: true };
}

export async function getNextEvent(): Promise<EventDoc | null> {
  const all = await getAllEvents();
  const now = Date.now();
  const upcoming = all.filter((e) => e.eventDate.getTime() > now);
  return upcoming[0] ?? null;
}

export async function getRecentPosts(limitCount = 20): Promise<UserPostDoc[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userPosts),
      orderBy("timePosted", "desc"),
      limit(limitCount),
    ),
  );
  return snap.docs.map((d) => mapPost(d.id, d.data()));
}

export async function getVideoPosts(limitCount = 20): Promise<UserPostDoc[]> {
  const { posts } = await getVideoPostsPage(limitCount);
  return posts;
}

export type VideoPostsPage = {
  posts: UserPostDoc[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

/** Paginated video posts — loops through batches until enough video posts collected. */
export async function getVideoPostsPage(
  pageSize = 12,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<VideoPostsPage> {
  const batchSize = 20;
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  const collected: { post: UserPostDoc; doc: QueryDocumentSnapshot<DocumentData> }[] = [];
  let hasMore = true;
  let pageCursor: QueryDocumentSnapshot<DocumentData> | null = cursor ?? null;

  while (collected.length < pageSize && hasMore) {
    const constraints: QueryConstraint[] = [
      orderBy("timePosted", "desc"),
      limit(batchSize),
    ];
    if (pageCursor) {
      constraints.push(startAfter(pageCursor));
    }

    const snap = await getDocs(
      query(collection(getFirebaseDb(), COLLECTIONS.userPosts), ...constraints),
    );

    if (snap.empty) {
      hasMore = false;
      break;
    }

    for (const d of snap.docs) {
      lastDoc = d;
      const post = mapPost(d.id, d.data());
      if (getPostVideoUrl(post)) {
        collected.push({ post, doc: d });
      }
      if (collected.length >= pageSize) break;
    }

    hasMore = snap.docs.length === batchSize;
    pageCursor = null;
  }

  return {
    posts: collected.map((r) => r.post),
    lastDoc: collected[collected.length - 1]?.doc ?? lastDoc,
    hasMore,
  };
}

const PROFILE_POSTS_PAGE = 40;

export async function getPostsByUser(
  userId: string,
  max = PROFILE_POSTS_PAGE,
): Promise<UserPostDoc[]> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userPosts),
      where("postUser", "==", userRef),
      orderBy("timePosted", "desc"),
      limit(max),
    ),
  );
  return snap.docs.map((d) => mapPost(d.id, d.data()));
}

/** Etiketlenen gönderiler — composite index gerektirmemek için sıralama istemci tarafında. */
export async function getPostsTaggingUser(
  userId: string,
  max = 80,
): Promise<UserPostDoc[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userPosts),
      where("tagged_user_ids", "array-contains", userId),
      limit(Math.min(max * 3, 200)),
    ),
  );
  return snap.docs
    .map((d) => mapPost(d.id, d.data()))
    .filter(hasPostMedia)
    .sort((a, b) => b.timePosted.getTime() - a.timePosted.getTime())
    .slice(0, max);
}

export async function getLikedPostsByUser(
  userId: string,
): Promise<UserPostDoc[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userPosts),
      orderBy("timePosted", "desc"),
      limit(50),
    ),
  );
  return snap.docs
    .map((d) => mapPost(d.id, d.data()))
    .filter((p) => p.likedByIds.includes(userId));
}

export async function getFollowStats(
  uid: string,
): Promise<{ followers: number; following: number }> {
  const db = getFirebaseDb();
  const userRef = doc(db, COLLECTIONS.users, uid);
  const [followersSnap, followingSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, COLLECTIONS.friends),
        where("followee", "==", userRef),
      ),
    ),
    getDocs(
      query(
        collection(db, COLLECTIONS.friends),
        where("follower", "==", userRef),
      ),
    ),
  ]);
  return {
    followers: followersSnap.size,
    following: followingSnap.size,
  };
}

/** Increments numViews by 1. Fire-and-forget — errors are silently ignored. */
export function incrementPostViews(postId: string): void {
  const postRef = doc(getFirebaseDb(), COLLECTIONS.userPosts, postId);
  updateDoc(postRef, { numViews: increment(1) }).catch(() => {});
}

export async function toggleLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean,
  actorName?: string,
): Promise<void> {
  const postRef = doc(getFirebaseDb(), COLLECTIONS.userPosts, postId);
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);

  if (currentlyLiked) {
    await updateDoc(postRef, { Post_liked_by: arrayRemove(userRef) });
  } else {
    await updateDoc(postRef, { Post_liked_by: arrayUnion(userRef) });
    const { notifyPostLike } = await import("@/lib/services/notifications");
    void notifyPostLike(postId, userId, actorName);
  }
}

export async function toggleSavePost(
  postId: string,
  userId: string,
  currentlySaved: boolean,
): Promise<void> {
  const postRef = doc(getFirebaseDb(), COLLECTIONS.userPosts, postId);
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);

  if (currentlySaved) {
    await updateDoc(postRef, { post_saved_by: arrayRemove(userRef) });
  } else {
    await updateDoc(postRef, { post_saved_by: arrayUnion(userRef) });
  }
}

export async function getPostComments(
  postId: string,
): Promise<PostCommentDoc[]> {
  const db = getFirebaseDb();
  const postRef = doc(db, COLLECTIONS.userPosts, postId);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.postComments),
      where("post", "==", postRef),
    ),
  );

  const comments = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      comment: (data.comment as string) ?? "",
      userId: refToId(data.user),
      timePosted: toDate(data.timePosted),
    };
  });

  comments.sort((a, b) => a.timePosted.getTime() - b.timePosted.getTime());

  const userCache = new Map<string, { name: string; photo: string }>();
  for (const comment of comments) {
    if (!comment.userId || userCache.has(comment.userId)) continue;
    const userSnap = await getDoc(doc(db, COLLECTIONS.users, comment.userId));
    if (userSnap.exists()) {
      const d = userSnap.data();
      userCache.set(comment.userId, {
        name: (d.display_name as string) || (d.userName as string) || "user",
        photo: (d.photo_url as string) ?? "",
      });
    }
  }

  return comments.map((c) => {
    const user = c.userId ? userCache.get(c.userId) : undefined;
    return {
      ...c,
      userName: user?.name,
      userPhoto: user?.photo,
    };
  });
}

export async function addPostComment(
  postId: string,
  userId: string,
  text: string,
  actorName?: string,
): Promise<void> {
  const db = getFirebaseDb();
  const postRef = doc(db, COLLECTIONS.userPosts, postId);
  const userRef = doc(db, COLLECTIONS.users, userId);
  const trimmed = text.trim();
  if (!trimmed) return;

  const commentRef = await addDoc(collection(db, COLLECTIONS.postComments), {
    comment: trimmed,
    user: userRef,
    post: postRef,
    timePosted: serverTimestamp(),
  });
  await updateDoc(postRef, { numComments: increment(1) });

  const { notifyPostComment } = await import("@/lib/services/notifications");
  void notifyPostComment(postId, userId, commentRef.id, actorName);
}

export async function getTeamMembers(): Promise<TeamMemberDoc[]> {
  const results: TeamMemberDoc[] = [];
  const seen = new Set<string>();

  for (const teamRole of TEAM_ROLES) {
    const snap = await getDocs(
      query(
        collection(getFirebaseDb(), COLLECTIONS.users),
        where("role", "==", teamRole),
      ),
    );
    for (const d of snap.docs) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      const data = d.data();
      const lastActive = data.last_active_time
        ? toDate(data.last_active_time)
        : undefined;
      results.push({
        id: d.id,
        name: (data.display_name as string) || (data.userName as string) || "",
        role: (data.role as string) || "",
        photo: (data.photo_url as string) ?? "",
        bio: (data.bio as string) ?? "",
        title: (data.title as string) ?? "",
        isActiveToday: lastActive ? isToday(lastActive) : false,
      });
    }
  }
  return results;
}

const USER_BATCH_SIZE = 10;

export async function fetchUsersByIds(
  userIds: string[],
): Promise<Map<string, { name: string; photo: string }>> {
  const result = new Map<string, { name: string; photo: string }>();
  if (!userIds.length) return result;

  const db = getFirebaseDb();
  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += USER_BATCH_SIZE) {
    chunks.push(userIds.slice(i, i + USER_BATCH_SIZE));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const snap = await getDocs(
        query(
          collection(db, COLLECTIONS.users),
          where(documentId(), "in", chunk),
        ),
      );
      for (const d of snap.docs) {
        const data = d.data();
        result.set(d.id, {
          name: (data.display_name as string) || (data.userName as string) || "user",
          photo: (data.photo_url as string) ?? "",
        });
      }
    }),
  );

  return result;
}

export async function enrichPostsWithUsers(
  posts: UserPostDoc[],
): Promise<(UserPostDoc & { userName?: string; userPhoto?: string })[]> {
  const uniqueIds = [
    ...new Set(posts.map((p) => p.postUserId).filter(Boolean)),
  ] as string[];
  const users = await fetchUsersByIds(uniqueIds);

  return posts.map((post) => {
    if (!post.postUserId) return post;
    const user = users.get(post.postUserId);
    return {
      ...post,
      userName: user?.name,
      userPhoto: user?.photo,
    };
  });
}

export function uploadVideo(
  file: File,
  userId: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  const path = `users/${userId}/uploads/${Date.now()}_${file.name}`;
  const storageRef = ref(getFirebaseStorage(), path);
  const task = uploadBytesResumable(storageRef, file, {
    cacheControl: STORAGE_MEDIA_CACHE_CONTROL,
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

export async function uploadVideoPost(
  file: File,
  userId: string,
  onProgress: (pct: number) => void,
  options?: {
    thumbnailBlob?: Blob;
    getThumbnailBlob?: () => Blob | null | undefined;
    /** Skip client preview encode during edit-screen preview (iOS decoder conflict) */
    skipClientPreview?: boolean;
  },
): Promise<{
  originalUrl: string;
  previewUrl: string;
  lowUrl: string;
  thumbnailUrl: string;
}> {
  onProgress(2);

  const stamp = Date.now();
  const ext = file.name.split(".").pop() || "mp4";
  const basePath = `users/${userId}/uploads/${stamp}`;

  let originalPct = 0;
  const originalUrl = await uploadBlob(file, `${basePath}/original.${ext}`, (pct) => {
    originalPct = pct;
    onProgress(5 + Math.round(originalPct * 0.65));
  });

  let previewUrl = "";
  if (!options?.skipClientPreview) {
    const { createPlaybackPreviewBlob } = await import("@/lib/utils/media-compress");
    const previewBlob = await createPlaybackPreviewBlob(file).catch(() => null);
    if (previewBlob) {
      previewUrl = await uploadBlob(previewBlob, `${basePath}/preview.mp4`, (pct) => {
        onProgress(72 + Math.round(pct * 0.12));
      });
    }
  }

  const playbackUrl = previewUrl || originalUrl;

  onProgress(86);
  const custom =
    options?.getThumbnailBlob?.() ?? options?.thumbnailBlob ?? null;
  const thumbnail =
    custom && isImageBlob(custom)
      ? custom
      : await videoThumbnailFromFile(file).catch(() => createPlaceholderThumbnail());

  const thumbnailUrl = await uploadBlob(thumbnail, `${basePath}/thumb.jpg`, (pct) => {
    onProgress(86 + Math.round(pct * 0.14));
  });

  onProgress(100);
  return {
    originalUrl,
    previewUrl: playbackUrl,
    lowUrl: playbackUrl,
    thumbnailUrl,
  };
}

/** Re-upload cover after draft video is already in Storage (user picked a new frame). */
export async function uploadVideoCoverForPost(
  videoOriginalUrl: string,
  coverBlob: Blob,
): Promise<string> {
  if (!isImageBlob(coverBlob)) {
    throw new Error("Cover must be an image");
  }
  const pathname = new URL(videoOriginalUrl).pathname;
  const encoded = pathname.match(/\/o\/(.+)/)?.[1];
  if (!encoded) throw new Error("Invalid video URL");
  const storagePath = decodeURIComponent(encoded.split("?")[0] ?? encoded);
  const thumbPath = storagePath.replace(/original\.[a-z0-9]+$/i, "thumb.jpg");
  return await uploadBlob(coverBlob, thumbPath);
}

export async function createVideoPost(
  originalUrl: string,
  lowUrl: string,
  thumbnailUrl: string,
  caption: string,
  userId: string,
  tags: PostTag[] = [],
  location?: string,
  previewUrl?: string,
): Promise<string> {
  const playbackUrl = previewUrl || lowUrl;
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.userPosts), {
    postVideo: originalUrl,
    postVideoURL: playbackUrl,
    postVideoURL_original: originalUrl,
    ...(previewUrl && previewUrl !== originalUrl ? { postVideoURL_preview: previewUrl } : {}),
    postVideoURL_low: lowUrl,
    postVideothumbnail: thumbnailUrl,
    videoTranscodeStatus: videoEncodeStatusForUpload(),
    videoThumbnailStatus: "done",
    postDescription: caption,
    postTitle: caption.slice(0, 80),
    postUser: userRef,
    timePosted: serverTimestamp(),
    DateCreated: serverTimestamp(),
    numComments: 0,
    Post_liked_by: [],
    allowComments: true,
    isPrivate: false,
    ...(location ? { location } : {}),
    ...buildPostTagFields(tags),
  });
  return docRef.id;
}

export async function uploadImagePost(
  file: File,
  userId: string,
  onProgress: (pct: number) => void,
): Promise<{ originalUrl: string; lowUrl: string }> {
  const stamp = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const basePath = `users/${userId}/uploads/${stamp}`;

  onProgress(5);
  let originalPct = 0;
  let compressDone = false;
  const report = () => {
    const compressPct = compressDone ? 100 : 0;
    onProgress(8 + Math.round(originalPct * 0.55 + compressPct * 0.12));
  };

  const lowBlobPromise = compressImage(file).then((blob) => {
    compressDone = true;
    report();
    return blob;
  });

  const originalUrl = await uploadBlob(
    file,
    `${basePath}/original.${ext}`,
    (pct) => {
      originalPct = pct;
      report();
    },
  );

  const lowBlob = await lowBlobPromise;
  const lowUrl = await uploadBlob(
    lowBlob,
    `${basePath}/low.jpg`,
    (pct) => onProgress(75 + Math.round(pct * 0.25)),
  );

  onProgress(100);
  return { originalUrl, lowUrl };
}

export async function createImagePost(
  originalUrl: string,
  lowUrl: string,
  caption: string,
  userId: string,
  tags: PostTag[] = [],
  location?: string,
): Promise<string> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.userPosts), {
    postPhoto: originalUrl,
    postPhotoURL: lowUrl,
    postPhotoURL_original: originalUrl,
    postPhotoURL_low: lowUrl,
    postDescription: caption,
    postTitle: caption.slice(0, 80),
    postUser: userRef,
    timePosted: serverTimestamp(),
    DateCreated: serverTimestamp(),
    numComments: 0,
    Post_liked_by: [],
    allowComments: true,
    isPrivate: false,
    ...(location ? { location } : {}),
    ...buildPostTagFields(tags),
  });
  return docRef.id;
}

function contentTypeForUpload(storagePath: string, blob: Blob): string {
  if (blob.type && blob.type !== "application/octet-stream") {
    return blob.type;
  }
  const ext = storagePath.split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    mp4: "video/mp4",
    m4v: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
  };
  return byExt[ext ?? ""] ?? (blob.type || "application/octet-stream");
}

export function uploadBlob(
  blob: Blob,
  storagePath: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const storageRef = ref(getFirebaseStorage(), storagePath);
  const task = uploadBytesResumable(storageRef, blob, {
    contentType: contentTypeForUpload(storagePath, blob),
    cacheControl: STORAGE_MEDIA_CACHE_CONTROL,
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        onProgress?.(
          Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
        );
      },
      reject,
      async () => {
        resolve(await getDownloadURL(task.snapshot.ref));
      },
    );
  });
}

export type ActivityUploadInput = {
  userId: string;
  eventId: string;
  activityName: string;
  location: string;
  participantCount: number;
  isVideo: boolean;
  originalFile: File;
  lowQualityBlob: Blob;
  thumbnailBlob?: Blob;
  tags?: PostTag[];
};

export type ActivityMediaUrls = {
  originalUrl: string;
  lowUrl: string;
  previewUrl?: string;
  thumbUrl?: string;
};

export async function uploadActivityMedia(
  input: {
    userId: string;
    isVideo: boolean;
    originalFile: File;
    lowQualityBlob: Blob;
    thumbnailBlob?: Blob;
    stamp?: number;
  },
  onProgress: (pct: number) => void,
): Promise<ActivityMediaUrls> {
  const stamp = input.stamp ?? Date.now();
  const basePath = `users/${input.userId}/activities/${stamp}`;
  const ext = input.isVideo
    ? input.originalFile.name.split(".").pop() || "mp4"
    : "jpg";

  onProgress(5);
  const uploads: Promise<string>[] = [
    uploadBlob(
      input.originalFile,
      `${basePath}/original.${ext}`,
      (pct) => onProgress(5 + Math.round(pct * 0.4)),
    ),
    uploadBlob(
      input.lowQualityBlob,
      `${basePath}/low.${input.isVideo ? ext : "jpg"}`,
      (pct) => onProgress(45 + Math.round(pct * 0.35)),
    ),
  ];

  if (input.isVideo && input.thumbnailBlob) {
    uploads.push(
      uploadBlob(
        input.thumbnailBlob,
        `${basePath}/thumb.jpg`,
        (pct) => onProgress(80 + Math.round(pct * 0.1)),
      ),
    );
  }

  const results = await Promise.all(uploads);
  return {
    originalUrl: results[0],
    lowUrl: results[1],
    thumbUrl: input.isVideo ? results[2] : results[1],
  };
}

export async function createActivityPostFromMedia(
  urls: ActivityMediaUrls,
  input: Omit<
    ActivityUploadInput,
    "originalFile" | "lowQualityBlob" | "thumbnailBlob"
  >,
): Promise<string> {
  const {
    userId,
    eventId,
    activityName,
    location,
    participantCount,
    isVideo,
    tags = [],
  } = input;

  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const postData: Record<string, unknown> = {
    postUser: userRef,
    postTitle: activityName,
    Activity_Name: activityName,
    activityName,
    location,
    participant_count: participantCount,
    event_id: eventId,
    category: "activity",
    postFrom: "animation_team",
    timePosted: serverTimestamp(),
    DateCreated: serverTimestamp(),
    numComments: 0,
    Post_liked_by: [],
    allowComments: true,
    isPrivate: false,
    ...buildPostTagFields(tags),
  };

  if (isVideo) {
    const playbackUrl = urls.previewUrl || urls.lowUrl;
    postData.postVideo = urls.originalUrl;
    postData.postVideoURL = playbackUrl;
    postData.postVideoURL_original = urls.originalUrl;
    if (urls.previewUrl && urls.previewUrl !== urls.originalUrl) {
      postData.postVideoURL_preview = urls.previewUrl;
    }
    postData.postVideoURL_low = urls.lowUrl;
    postData.postVideothumbnail = urls.thumbUrl ?? urls.lowUrl;
    postData.videoTranscodeStatus = videoEncodeStatusForUpload();
    if (urls.thumbUrl) {
      postData.videoThumbnailStatus = "done";
    }
  } else {
    postData.postPhoto = urls.originalUrl;
    postData.postPhotoURL = urls.lowUrl;
    postData.postPhotoURL_original = urls.originalUrl;
    postData.postPhotoURL_low = urls.lowUrl;
  }

  const docRef = await addDoc(
    collection(getFirebaseDb(), COLLECTIONS.userPosts),
    postData,
  );

  await updateDoc(userRef, {
    total_activity_participants: increment(participantCount),
  });

  return docRef.id;
}

export async function createActivityUpload(
  input: ActivityUploadInput,
  onProgress: (pct: number) => void,
): Promise<string> {
  const urls = await uploadActivityMedia(
    {
      userId: input.userId,
      isVideo: input.isVideo,
      originalFile: input.originalFile,
      lowQualityBlob: input.lowQualityBlob,
      thumbnailBlob: input.thumbnailBlob,
    },
    onProgress,
  );

  onProgress(92);
  const id = await createActivityPostFromMedia(urls, input);
  onProgress(100);
  return id;
}

function storagePathFromDownloadUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const encoded = parsed.pathname.match(/\/o\/(.+)/)?.[1];
    if (!encoded) return null;
    return decodeURIComponent(encoded.split("?")[0] ?? encoded);
  } catch {
    return null;
  }
}

async function deleteStorageUrls(urls: (string | undefined)[]): Promise<void> {
  const storage = getFirebaseStorage();
  const paths = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    const path = storagePathFromDownloadUrl(url);
    if (path) paths.add(path);
  }
  await Promise.allSettled(
    [...paths].map((path) => deleteObject(ref(storage, path))),
  );
}

function collectPostMediaUrls(data: Record<string, unknown>): string[] {
  const keys = [
    "postPhoto",
    "postPhotoURL",
    "postPhotoURL_original",
    "postPhotoURL_low",
    "postVideo",
    "postVideoURL",
    "postVideoURL_original",
    "postVideoURL_low",
    "postVideothumbnail",
  ];
  return keys
    .map((key) => data[key] as string | undefined)
    .filter((url): url is string => Boolean(url));
}

async function getOwnedPostRef(postId: string, userId: string) {
  const postRef = doc(getFirebaseDb(), COLLECTIONS.userPosts, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error("Post not found");
  const data = snap.data();
  if (refToId(data.postUser) !== userId) throw new Error("Forbidden");
  return { postRef, data };
}

export async function deleteUserPost(
  postId: string,
  userId: string,
): Promise<void> {
  const { postRef, data } = await getOwnedPostRef(postId, userId);
  await deleteStorageUrls(collectPostMediaUrls(data));
  await deleteDoc(postRef);
}

const REPOST_COPY_FIELDS = [
  "postPhoto",
  "postPhotoURL",
  "postPhotoURL_original",
  "postPhotoURL_low",
  "postVideo",
  "postVideoURL",
  "postVideoURL_original",
  "postVideoURL_low",
  "postVideothumbnail",
  "postDescription",
  "postTitle",
  "Activity_Name",
  "activityName",
  "category",
  "location",
  "participant_count",
  "event_id",
  "tagged_user_ids",
  "tagged_people",
  "tagged_users",
] as const;

export async function repostUserPost(
  sourcePostId: string,
  userId: string,
): Promise<string> {
  const db = getFirebaseDb();
  const sourceRef = doc(db, COLLECTIONS.userPosts, sourcePostId);
  const snap = await getDoc(sourceRef);
  if (!snap.exists()) throw new Error("Post not found");

  const data = snap.data();
  const sourceOwnerId = refToId(data.postUser);
  if (!sourceOwnerId) throw new Error("Post owner not found");
  if (sourceOwnerId === userId) throw new Error("Cannot repost own post");

  const userRef = doc(db, COLLECTIONS.users, userId);
  const postData: Record<string, unknown> = {
    postUser: userRef,
    timePosted: serverTimestamp(),
    DateCreated: serverTimestamp(),
    numComments: 0,
    Post_liked_by: [],
    post_saved_by: [],
    allowComments: true,
    isPrivate: false,
    repostOf: sourceRef,
  };

  for (const key of REPOST_COPY_FIELDS) {
    if (data[key] !== undefined) postData[key] = data[key];
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.userPosts), postData);

  const { notifyPostRepost } = await import("@/lib/services/notifications");
  notifyPostRepost(sourceOwnerId, userId, sourcePostId);

  return docRef.id;
}

export async function updateUserPostCaption(
  postId: string,
  userId: string,
  caption: string,
): Promise<void> {
  const { postRef } = await getOwnedPostRef(postId, userId);
  await updateDoc(postRef, {
    postDescription: caption,
    postTitle: caption.slice(0, 80),
    DateUpdated: serverTimestamp(),
  });
}

export async function replaceUserPostVideo(
  postId: string,
  userId: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { postRef, data } = await getOwnedPostRef(postId, userId);
  const oldUrls = collectPostMediaUrls(data);
  const { originalUrl, lowUrl, thumbnailUrl } = await uploadVideoPost(
    file,
    userId,
    onProgress,
  );
  await updateDoc(postRef, {
    postVideo: originalUrl,
    postVideoURL: lowUrl,
    postVideoURL_original: originalUrl,
    postVideoURL_low: lowUrl,
    postVideothumbnail: thumbnailUrl,
    videoTranscodeStatus: videoEncodeStatusForUpload(),
    videoThumbnailStatus: "done",
    DateUpdated: serverTimestamp(),
  });
  await deleteStorageUrls(oldUrls);
}

export async function replaceUserPostImage(
  postId: string,
  userId: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  const { postRef, data } = await getOwnedPostRef(postId, userId);
  const oldUrls = collectPostMediaUrls(data);
  const stamp = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const basePath = `users/${userId}/uploads/${stamp}`;

  onProgress(8);
  const lowBlob = await compressImage(file);
  onProgress(20);

  const [originalUrl, lowUrl] = await Promise.all([
    uploadBlob(
      file,
      `${basePath}/original.${ext}`,
      (pct) => onProgress(20 + Math.round(pct * 0.4)),
    ),
    uploadBlob(
      lowBlob,
      `${basePath}/low.jpg`,
      (pct) => onProgress(60 + Math.round(pct * 0.35)),
    ),
  ]);

  await updateDoc(postRef, {
    postPhoto: originalUrl,
    postPhotoURL: lowUrl,
    postPhotoURL_original: originalUrl,
    postPhotoURL_low: lowUrl,
    DateUpdated: serverTimestamp(),
  });
  onProgress(100);
  await deleteStorageUrls(oldUrls);
}
