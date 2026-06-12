import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/errors";
import { COLLECTIONS } from "@/types";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  try {
    const db = getAdminDb();
    const [usersSnap, postsSnap, eventsSnap] = await Promise.all([
      db.collection(COLLECTIONS.users).count().get(),
      db.collection(COLLECTIONS.userPosts).count().get(),
      db.collection(COLLECTIONS.eventListPortyApp).count().get(),
    ]);

    return apiOk({
      users: usersSnap.data().count,
      posts: postsSnap.data().count,
      events: eventsSnap.data().count,
    });
  } catch {
    return apiError(500, "FETCH_FAILED", "Failed to fetch stats.");
  }
}
