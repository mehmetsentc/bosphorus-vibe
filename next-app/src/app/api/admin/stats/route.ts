import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/errors";
import { COLLECTIONS } from "@/types";
import type { Firestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

async function collectionCount(db: Firestore, name: string): Promise<number> {
  try {
    const snap = await db.collection(name).count().get();
    return snap.data().count;
  } catch {
    const snap = await db.collection(name).select().limit(5000).get();
    return snap.size;
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch (e) {
    const forbidden = e instanceof Error && e.message === "FORBIDDEN";
    return apiError(
      forbidden ? 403 : 401,
      forbidden ? "FORBIDDEN" : "UNAUTHORIZED",
      forbidden ? "Admin access required." : "Unauthorized.",
    );
  }

  try {
    const db = getAdminDb();
    const [users, posts, events] = await Promise.all([
      collectionCount(db, COLLECTIONS.users),
      collectionCount(db, COLLECTIONS.userPosts),
      collectionCount(db, COLLECTIONS.eventListPortyApp),
    ]);

    return apiOk({ users, posts, events });
  } catch {
    return apiError(500, "FETCH_FAILED", "Failed to fetch stats.");
  }
}
