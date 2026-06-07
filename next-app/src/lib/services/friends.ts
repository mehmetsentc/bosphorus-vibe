import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/types";

export type PublicUser = {
  uid: string;
  display_name: string;
  userName: string;
  photo_url: string;
  role: string;
};

function mapPublicUser(uid: string, data: Record<string, unknown>): PublicUser {
  return {
    uid,
    display_name: (data.display_name as string) || (data.userName as string) || "",
    userName: (data.userName as string) || (data.display_name as string) || "",
    photo_url: (data.photo_url as string) ?? "",
    role: (data.role as string) ?? "",
  };
}

export async function listUsersForFriends(
  excludeUid: string,
  max = 60,
): Promise<PublicUser[]> {
  const snap = await getDocs(
    query(collection(getFirebaseDb(), COLLECTIONS.users), limit(max)),
  );
  return snap.docs
    .filter((d) => d.id !== excludeUid)
    .map((d) => mapPublicUser(d.id, d.data()));
}

export async function getSuggestedUsers(
  currentUid: string,
  following: Set<string>,
  max = 8,
): Promise<PublicUser[]> {
  const users = await listUsersForFriends(currentUid, 80);
  return users.filter((u) => !following.has(u.uid)).slice(0, max);
}

export async function getFollowingSet(followerUid: string): Promise<Set<string>> {
  const db = getFirebaseDb();
  const followerRef = doc(db, COLLECTIONS.users, followerUid);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.friends),
      where("follower", "==", followerRef),
    ),
  );
  const ids = new Set<string>();
  for (const d of snap.docs) {
    const followee = d.data().followee;
    if (followee && typeof followee === "object" && "id" in followee) {
      ids.add((followee as { id: string }).id);
    }
  }
  return ids;
}

export async function getFollowerUids(followeeUid: string): Promise<string[]> {
  const db = getFirebaseDb();
  const followeeRef = doc(db, COLLECTIONS.users, followeeUid);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.friends),
      where("followee", "==", followeeRef),
    ),
  );
  const ids: string[] = [];
  for (const d of snap.docs) {
    const follower = d.data().follower;
    if (follower && typeof follower === "object" && "id" in follower) {
      ids.push((follower as { id: string }).id);
    }
  }
  return ids;
}

async function getUsersByIds(uids: string[]): Promise<PublicUser[]> {
  if (!uids.length) return [];
  const db = getFirebaseDb();
  const users = await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
      if (!snap.exists()) return null;
      return mapPublicUser(uid, snap.data());
    }),
  );
  return users.filter((u): u is PublicUser => u !== null);
}

export async function listFollowingUsers(userUid: string): Promise<PublicUser[]> {
  const ids = [...(await getFollowingSet(userUid))];
  return getUsersByIds(ids);
}

export async function listFollowerUsers(userUid: string): Promise<PublicUser[]> {
  const ids = await getFollowerUids(userUid);
  return getUsersByIds(ids);
}

export async function isFollowing(
  followerUid: string,
  followeeUid: string,
): Promise<boolean> {
  const set = await getFollowingSet(followerUid);
  return set.has(followeeUid);
}

export async function followUser(
  followerUid: string,
  followeeUid: string,
): Promise<void> {
  if (followerUid === followeeUid) return;
  const already = await isFollowing(followerUid, followeeUid);
  if (already) return;

  const db = getFirebaseDb();
  await addDoc(collection(db, COLLECTIONS.friends), {
    follower: doc(db, COLLECTIONS.users, followerUid),
    followee: doc(db, COLLECTIONS.users, followeeUid),
  });
}

export async function unfollowUser(
  followerUid: string,
  followeeUid: string,
): Promise<void> {
  const db = getFirebaseDb();
  const followerRef = doc(db, COLLECTIONS.users, followerUid);
  const followeeRef = doc(db, COLLECTIONS.users, followeeUid);
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.friends),
      where("follower", "==", followerRef),
      where("followee", "==", followeeRef),
    ),
  );
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
