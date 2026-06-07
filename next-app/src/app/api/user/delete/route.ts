import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { requireSession } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { clearServerAuthCookies } from "@/lib/session/server-cookies";
import { deleteAccountSchema } from "@/lib/validation/schemas";
import { COLLECTIONS } from "@/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let uid: string;
  try {
    const decoded = await requireSession();
    uid = decoded.uid;
  } catch {
    return apiError(401, "UNAUTHORIZED", "You must be signed in.");
  }

  const limited = rateLimit(rateLimitKey(ip, uid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  try {
    const json = await request.json();
    deleteAccountSchema.parse(json);
  } catch {
    return apiError(400, "INVALID_BODY", "Confirmation required.");
  }

  try {
    const db = getAdminDb();
    const userRef = db.collection(COLLECTIONS.users).doc(uid);

    const posts = await db
      .collection(COLLECTIONS.userPosts)
      .where("postUser", "==", userRef)
      .limit(500)
      .get();

    const batch = db.batch();
    posts.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(db.collection(COLLECTIONS.users).doc(uid));
    await batch.commit();

    await getAdminAuth().deleteUser(uid);
    clearServerAuthCookies();
    await writeAuditLog("delete_account", uid, { ip });

    return apiOk({ ok: true });
  } catch {
    return apiError(500, "DELETE_FAILED", GENERIC_ERROR);
  }
}
