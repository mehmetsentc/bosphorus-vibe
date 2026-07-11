import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { COLLECTIONS } from "@/types";

type AdminUserApiRow = {
  uid: string;
  display_name: string;
  userName: string;
  email: string;
  photo_url: string;
  role: string;
  isAnonymous: boolean;
  created_time: string | null;
};

/** GET /api/admin/users — list users */
export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return apiError(403, "FORBIDDEN", "Admin access required.");
  }

  try {
    const users: AdminUserApiRow[] = [];
    let lastDoc: QueryDocumentSnapshot | undefined;

    while (true) {
      let q = getAdminDb()
        .collection(COLLECTIONS.users)
        .orderBy("created_time", "desc")
        .limit(500);
      if (lastDoc) q = q.startAfter(lastDoc);

      const snap = await q.get();
      if (snap.empty) break;

      for (const doc of snap.docs) {
        const d = doc.data();
        users.push({
          uid: doc.id,
          display_name: d.display_name ?? "",
          userName: d.userName ?? "",
          email: d.email ?? "",
          photo_url: d.photo_url ?? "",
          role: d.role ?? "user",
          isAnonymous: d.isAnonymous === true,
          created_time: d.created_time?.toDate?.()?.toISOString() ?? null,
        });
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.size < 500) break;
    }

    return apiOk({ users });
  } catch {
    return apiError(500, "FETCH_FAILED", GENERIC_ERROR);
  }
}
