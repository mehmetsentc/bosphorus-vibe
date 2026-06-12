import { FieldPath } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { postNeedsVideoTranscode } from "@/lib/admin/video-transcode";
import { requireAdmin } from "@/lib/api/auth";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import { COLLECTIONS } from "@/types";

const PAGE_SIZE = 100;
const MAX_MARK = 500;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let adminUid: string;
  try {
    const decoded = await requireAdmin();
    adminUid = decoded.uid;
  } catch (e) {
    const msg = e instanceof Error && e.message === "FORBIDDEN" ? "Forbidden." : "Unauthorized.";
    return apiError(e instanceof Error && e.message === "FORBIDDEN" ? 403 : 401, "FORBIDDEN", msg);
  }

  const limited = rateLimit(rateLimitKey(ip, adminUid));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests.");
  }

  let maxMark = MAX_MARK;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.limit === "number" && body.limit > 0) {
      maxMark = Math.min(Math.floor(body.limit), MAX_MARK);
    }
  } catch {
    // optional body
  }

  try {
    const db = getAdminDb();
    let lastId: string | undefined;
    let scanned = 0;
    let marked = 0;
    let alreadyQueued = 0;

    while (marked < maxMark) {
      let query = db
        .collection(COLLECTIONS.userPosts)
        .orderBy(FieldPath.documentId())
        .limit(PAGE_SIZE);

      if (lastId) {
        query = query.startAfter(lastId);
      }

      const snap = await query.get();
      if (snap.empty) break;

      const batch = db.batch();
      let batchWrites = 0;

      for (const doc of snap.docs) {
        scanned += 1;
        const data = doc.data();
        if (!postNeedsVideoTranscode(data)) continue;

        const status = data.videoTranscodeStatus as string | undefined;
        if (status === "pending" || status === "processing") {
          alreadyQueued += 1;
          continue;
        }

        batch.update(doc.ref, {
          videoTranscodeStatus: "pending",
          videoTranscodeUpdatedAt: new Date(),
        });
        marked += 1;
        batchWrites += 1;

        if (marked >= maxMark) break;
      }

      if (batchWrites > 0) await batch.commit();

      lastId = snap.docs[snap.docs.length - 1]?.id;
      if (snap.size < PAGE_SIZE) break;
    }

    await writeAuditLog("admin_transcode_enqueue", adminUid, {
      ip,
      scanned,
      marked,
      alreadyQueued,
    });

    return apiOk({ scanned, marked, alreadyQueued });
  } catch {
    return apiError(500, "ENQUEUE_FAILED", GENERIC_ERROR);
  }
}
