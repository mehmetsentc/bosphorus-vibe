import type { EnrichedPost } from "@/store/appStore";
import {
  enrichPostsWithUsers,
  getVideoPostsPage,
} from "@/lib/services/firestore";
import {
  getReelsRecentWindowStart,
  sortPostsByReelsPopularity,
} from "@/lib/reels/reels-feed-algorithm";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { UserPostDoc } from "@/types";

const PAGE_FETCH_SIZE = 50;
const MAX_CATALOG_SIZE = 2000;

let rankedPosts: UserPostDoc[] = [];
let fetchCursor: QueryDocumentSnapshot<DocumentData> | null = null;
let fetchHasMore = true;
let extendPromise: Promise<void> | null = null;

export function resetReelsPopularCatalog(): void {
  rankedPosts = [];
  fetchCursor = null;
  fetchHasMore = true;
  extendPromise = null;
}

async function extendCatalog(minLength: number): Promise<void> {
  const windowStart = getReelsRecentWindowStart();

  while (
    rankedPosts.length < minLength &&
    fetchHasMore &&
    rankedPosts.length < MAX_CATALOG_SIZE
  ) {
    const page = await getVideoPostsPage(PAGE_FETCH_SIZE, fetchCursor);
    for (const post of page.posts) {
      if (post.timePosted.getTime() < windowStart.getTime()) {
        rankedPosts.push(post);
      }
    }
    fetchCursor = page.lastDoc;
    fetchHasMore = page.hasMore;
    if (!page.posts.length) break;
  }

  rankedPosts = sortPostsByReelsPopularity(rankedPosts);
}

async function ensureCatalogLength(minLength: number): Promise<void> {
  if (rankedPosts.length >= minLength || !fetchHasMore) return;

  if (!extendPromise) {
    extendPromise = extendCatalog(minLength).finally(() => {
      extendPromise = null;
    });
  }

  await extendPromise;

  if (rankedPosts.length < minLength && fetchHasMore) {
    await extendCatalog(minLength);
  }
}

export async function sliceReelsPopularCatalog(
  offset: number,
  pageSize: number,
): Promise<{ posts: EnrichedPost[]; hasMore: boolean; nextOffset: number }> {
  const needed = offset + pageSize;
  await ensureCatalogLength(needed);

  const slice = rankedPosts.slice(offset, offset + pageSize);
  const posts = await enrichPostsWithUsers(slice);
  const nextOffset = offset + slice.length;
  const hasMore =
    nextOffset < rankedPosts.length ||
    (fetchHasMore && rankedPosts.length < MAX_CATALOG_SIZE);

  return {
    posts,
    hasMore,
    nextOffset,
  };
}
