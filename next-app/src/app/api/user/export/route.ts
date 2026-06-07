import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession } from "@/lib/api/auth";
import { apiError, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { COLLECTIONS } from "@/types";

export async function GET(request: NextRequest) {
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
    const db = getAdminDb();
    const userRef = db.collection(COLLECTIONS.users).doc(uid);
    const [userSnap, postsSnap, commentsSnap] = await Promise.all([
      userRef.get(),
      db
        .collection(COLLECTIONS.userPosts)
        .where("postUser", "==", userRef)
        .limit(500)
        .get(),
      db
        .collection(COLLECTIONS.postComments)
        .where("user", "==", userRef)
        .limit(500)
        .get(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      user: userSnap.data() ?? null,
      posts: postsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      comments: commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    await writeAuditLog("export_data", uid, { ip });

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bosphorus-vibe-export-${uid}.json"`,
      },
    });
  } catch {
    return apiError(500, "EXPORT_FAILED", GENERIC_ERROR);
  }
}
