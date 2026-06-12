import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import type { NetworkTier } from "@/lib/hooks/useNetworkQuality";
import { compressImage } from "@/lib/utils/media-compress";
import {
  prepareStoryImageFile,
  prepareStoryVideoFile,
} from "@/lib/utils/story-media";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import { refToId, refsToIds, toDate } from "@/lib/utils/firestore-helpers";
import { buildPostTagFields, parseTaggedPeople } from "@/lib/utils/post-tags";
import { COLLECTIONS, type StoryCategory, type StoryDoc, type StoryUserGroup, type PostTag } from "@/types";
import {
  fetchUsersByIds,
  uploadBlob,
  uploadVideoPost,
} from "@/lib/services/firestore";

export const STORY_TTL_MS = 24 * 60 * 60 * 1000;

function mapStory(id: string, data: Record<string, unknown>): StoryDoc {
  return {
    id,
    userId: refToId(data.user) ?? "",
    storyPhoto: (data.storyPhoto as string) || undefined,
    storyVideo: (data.storyVideo as string) || undefined,
    storyVideo_low: (data.storyVideo_low as string) || undefined,
    videoUrl: (data.video_url as string) || undefined,
    videoUrl_low: (data.video_url_low as string) || undefined,
    storyDescription: (data.storyDescription as string) || undefined,
    storyCategory: (data.storyCategory as StoryDoc["storyCategory"]) || undefined,
    eventId: (data.event_id as string) || undefined,
    storyPostedAt: toDate(data.storyPostedAt),
    expiredAt: data.expiredAt ? toDate(data.expiredAt) : undefined,
    isExpired: Boolean(data.isExpired),
    viewedByIds: refsToIds(data.viewedBy),
    numComments: (data.numComments as number) ?? 0,
    taggedPeople: parseTaggedPeople(data.tagged_people),
  };
}

export function pickStoryVideoSource(
  story: StoryDoc,
  tier: NetworkTier,
): { src: string; poster?: string } {
  const original = story.storyVideo || story.videoUrl || "";
  const low = story.storyVideo_low || story.videoUrl_low || story.videoUrl || "";
  const poster = story.storyPhoto || undefined;

  if (tier === "slow") {
    return { src: low || original, poster };
  }
  return { src: original || low, poster };
}

export function getStoryMediaUrl(story: StoryDoc): string {
  return story.storyVideo || story.videoUrl || story.storyPhoto || "";
}

export function isStoryVideo(story: StoryDoc): boolean {
  return Boolean(story.storyVideo || story.videoUrl);
}

function storyExpiresAt(story: StoryDoc): number {
  if (story.expiredAt) return story.expiredAt.getTime();
  return story.storyPostedAt.getTime() + STORY_TTL_MS;
}

export function isStoryExpired(story: StoryDoc, now = Date.now()): boolean {
  if (story.isExpired) return true;
  return storyExpiresAt(story) <= now;
}

function isStoryActive(story: StoryDoc, now = Date.now()): boolean {
  if (isStoryExpired(story, now)) return false;
  return Boolean(getStoryMediaUrl(story));
}

function expiresAtFrom(postedAt: Date): Date {
  return new Date(postedAt.getTime() + STORY_TTL_MS);
}

function collectStoryStorageUrls(data: Record<string, unknown>): string[] {
  return [
    data.storyPhoto as string,
    data.storyVideo as string,
    data.storyVideo_low as string,
    data.video_url as string,
    data.video_url_low as string,
  ].filter(Boolean);
}

async function deleteStoryStorageFiles(urls: string[]): Promise<void> {
  const storage = getFirebaseStorage();
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const parsed = new URL(url);
        const encoded = parsed.pathname.match(/\/o\/(.+)/)?.[1];
        if (!encoded) return;
        const path = decodeURIComponent(encoded.split("?")[0] ?? encoded);
        await deleteObject(ref(storage, path));
      } catch {
        /* ignore */
      }
    }),
  );
}

async function removeStoryRecord(
  storyId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const storyRef = doc(getFirebaseDb(), COLLECTIONS.userStories, storyId);
  await deleteDoc(storyRef);
  await deleteStoryStorageFiles(collectStoryStorageUrls(data));
}

/** Owner's expired stories — delete from Firestore + Storage. */
export async function cleanupOwnExpiredStories(userId: string): Promise<number> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userStories),
      where("user", "==", userRef),
    ),
  );

  const now = Date.now();
  let removed = 0;

  await Promise.allSettled(
    snap.docs.map(async (storyDoc) => {
      const story = mapStory(storyDoc.id, storyDoc.data());
      if (!isStoryExpired(story, now)) return;
      await removeStoryRecord(storyDoc.id, storyDoc.data());
      removed += 1;
    }),
  );

  return removed;
}

export async function getActiveStories(limitCount = 120): Promise<StoryDoc[]> {
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userStories),
      orderBy("storyPostedAt", "desc"),
      limit(limitCount),
    ),
  );

  const now = Date.now();
  return snap.docs
    .map((d) => mapStory(d.id, d.data()))
    .filter((story) => isStoryActive(story, now))
    .sort((a, b) => a.storyPostedAt.getTime() - b.storyPostedAt.getTime());
}

export async function getStoriesByUser(userId: string): Promise<StoryDoc[]> {
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  const snap = await getDocs(
    query(
      collection(getFirebaseDb(), COLLECTIONS.userStories),
      where("user", "==", userRef),
    ),
  );
  const now = Date.now();
  return snap.docs
    .map((d) => mapStory(d.id, d.data()))
    .filter((story) => isStoryActive(story, now))
    .sort((a, b) => a.storyPostedAt.getTime() - b.storyPostedAt.getTime());
}

export async function groupStoriesByUser(
  stories: StoryDoc[],
  viewerUid?: string,
): Promise<StoryUserGroup[]> {
  const now = Date.now();
  const activeStories = stories.filter((story) => isStoryActive(story, now));

  const byUser = new Map<string, StoryDoc[]>();
  for (const story of activeStories) {
    if (!story.userId) continue;
    const list = byUser.get(story.userId) ?? [];
    list.push(story);
    byUser.set(story.userId, list);
  }

  const userIds = [...byUser.keys()];
  const batchMeta = await fetchUsersByIds(userIds);
  const cache = new Map<string, { userName: string; userPhoto: string }>();
  for (const [id, meta] of batchMeta) {
    cache.set(id, { userName: meta.name, userPhoto: meta.photo });
  }
  const groups: StoryUserGroup[] = [];

  for (const [userId, userStories] of byUser) {
    const sorted = [...userStories].sort(
      (a, b) => a.storyPostedAt.getTime() - b.storyPostedAt.getTime(),
    );
    const meta = cache.get(userId) ?? { userName: "user", userPhoto: "" };
    const hasUnviewed = viewerUid
      ? sorted.some((s) => !s.viewedByIds.includes(viewerUid))
      : true;
    groups.push({
      userId,
      userName: meta.userName,
      userPhoto: meta.userPhoto,
      stories: sorted,
      hasUnviewed,
      latestAt: sorted[sorted.length - 1]?.storyPostedAt ?? new Date(0),
    });
  }

  groups.sort((a, b) => {
    if (viewerUid) {
      if (a.userId === viewerUid && b.userId !== viewerUid) return -1;
      if (b.userId === viewerUid && a.userId !== viewerUid) return 1;
    }
    if (a.hasUnviewed !== b.hasUnviewed) return a.hasUnviewed ? -1 : 1;
    return b.latestAt.getTime() - a.latestAt.getTime();
  });

  return groups;
}

export async function createStory(input: {
  userId: string;
  photoUrl?: string;
  videoOriginalUrl?: string;
  videoLowUrl?: string;
  description?: string;
  storyCategory?: StoryCategory;
  eventId?: string;
  tags?: PostTag[];
}): Promise<string> {
  const postedAt = new Date();
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, input.userId);
  const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.userStories), {
    user: userRef,
    storyPhoto: input.photoUrl ?? "",
    storyVideo: input.videoOriginalUrl ?? "",
    storyVideo_low: input.videoLowUrl ?? "",
    video_url: input.videoLowUrl ?? input.videoOriginalUrl ?? "",
    video_url_low: input.videoLowUrl ?? "",
    storyDescription: input.description ?? "",
    storyCategory: input.storyCategory ?? "vibe",
    event_id: input.eventId ?? "",
    storyPostedAt: serverTimestamp(),
    expiredAt: expiresAtFrom(postedAt),
    isExpired: false,
    isOwner: true,
    numComments: 0,
    likes: [],
    viewedBy: [userRef],
    clicked: [],
    ...buildPostTagFields(input.tags ?? []),
  });
  return docRef.id;
}

export async function uploadStoryImage(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  onProgress?.(3);
  const prepared = await prepareStoryImageFile(file);
  onProgress?.(8);
  const lowBlob = await compressImage(prepared);
  const stamp = Date.now();
  const ext = prepared.name.split(".").pop() || "jpg";
  const base = `users/${userId}/stories/${stamp}`;
  onProgress?.(18);
  const [originalUrl, lowUrl] = await Promise.all([
    uploadBlob(prepared, `${base}/original.${ext}`, (p) =>
      onProgress?.(18 + Math.round(p * 0.35)),
    ),
    uploadBlob(lowBlob, `${base}/low.jpg`, (p) =>
      onProgress?.(53 + Math.round(p * 0.35)),
    ),
  ]);
  onProgress?.(100);
  return lowUrl || originalUrl;
}

export async function uploadStoryVideo(
  file: File,
  userId: string,
  onProgress: (pct: number) => void,
  options?: {
    thumbnailBlob?: Blob;
    getThumbnailBlob?: () => Blob | null | undefined;
  },
): Promise<{ originalUrl: string; lowUrl: string; thumbnailUrl: string }> {
  const prepared = await prepareStoryVideoFile(file);
  return uploadVideoPost(prepared, userId, onProgress, options);
}

export async function markStoryViewed(
  storyId: string,
  userId: string,
): Promise<void> {
  const storyRef = doc(getFirebaseDb(), COLLECTIONS.userStories, storyId);
  const userRef = doc(getFirebaseDb(), COLLECTIONS.users, userId);
  await updateDoc(storyRef, {
    viewedBy: arrayUnion(userRef),
  });
}

export function subscribeStory(
  storyId: string,
  onData: (story: StoryDoc | null) => void,
): Unsubscribe {
  const storyRef = doc(getFirebaseDb(), COLLECTIONS.userStories, storyId);
  return onSnapshot(storyRef, (snap) => {
    if (!snap.exists()) {
      onData(null);
      return;
    }
    onData(mapStory(snap.id, snap.data()));
  });
}

export async function deleteStory(
  storyId: string,
  userId: string,
): Promise<void> {
  const storyRef = doc(getFirebaseDb(), COLLECTIONS.userStories, storyId);
  const snap = await getDoc(storyRef);
  if (!snap.exists()) return;
  const data = snap.data();
  if (refToId(data.user) !== userId) throw new Error("Forbidden");
  await removeStoryRecord(storyId, data);
}

export function storyCoverUrl(story: StoryDoc): string {
  if (story.storyPhoto) return story.storyPhoto;
  return story.storyVideo || story.videoUrl || "";
}

export async function createStoryFromPost(
  postId: string,
  userId: string,
): Promise<string> {
  const { getPostById, getPostCaption, getPostImageUrl, getPostVideoUrl } =
    await import("@/lib/services/firestore");

  const post = await getPostById(postId);
  if (!post) throw new Error("Post not found");

  const category = post.eventId
    ? "events"
    : getPostVideoUrl(post)
      ? "reels"
      : "vibe";
  const caption = getPostCaption(post);

  const videoOriginal =
    post.postVideoURL_original || post.postVideo || post.postVideoURL || "";
  const videoLow =
    post.postVideoURL_low || post.postVideoURL || post.postVideo || "";

  if (videoOriginal || videoLow) {
    return createStory({
      userId,
      photoUrl: post.postVideothumbnail || getPostImageUrl(post) || "",
      videoOriginalUrl: videoOriginal || videoLow,
      videoLowUrl: videoLow || videoOriginal,
      storyCategory: category,
      description: caption,
    });
  }

  const image = getPostImageUrl(post);
  if (!image) throw new Error("No media");

  return createStory({
    userId,
    photoUrl: image,
    storyCategory: category,
    description: caption,
  });
}

export function getStoryRemainingMs(story: StoryDoc, now = Date.now()): number {
  return Math.max(0, storyExpiresAt(story) - now);
}
