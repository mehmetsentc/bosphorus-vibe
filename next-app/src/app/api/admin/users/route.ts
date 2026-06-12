import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { COLLECTIONS } from "@/types";

/** GET /api/admin/users — list users */
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.users)
      .orderBy("created_time", "desc")
      .limit(200)
      .get();

    const users = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        display_name: d.display_name ?? "",
        userName: d.userName ?? "",
        email: d.email ?? "",
        photo_url: d.photo_url ?? "",
        role: d.role ?? "user",
        created_time: d.created_time?.toDate?.()?.toISOString() ?? null,
      };
    });

    return apiOk({ users });
  } catch {
    return apiError(500, "FETCH_FAILED", GENERIC_ERROR);
  }
}
