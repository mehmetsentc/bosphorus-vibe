import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase/admin";
import { apiError, apiOk, GENERIC_ERROR } from "@/lib/api/errors";
import { writeAuditLog } from "@/lib/security/audit-log";
import { rateLimit, rateLimitKey } from "@/lib/security/rate-limit";
import {
  clearServerAuthCookies,
  setServerAccessCookie,
  setServerSessionCookie,
} from "@/lib/session/server-cookies";
import { sessionBodySchema } from "@/lib/validation/schemas";
import { createSessionCookie, getSessionUser } from "@/lib/api/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = rateLimit(rateLimitKey(ip));
  if (!limited.ok) {
    return apiError(429, "RATE_LIMIT", "Too many requests. Please wait and try again.");
  }

  let body: z.infer<typeof sessionBodySchema>;
  try {
    const json = await request.json();
    body = sessionBodySchema.parse(json);
  } catch {
    return apiError(400, "INVALID_BODY", "Invalid request.");
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(body.idToken);
    const session = await createSessionCookie(body.idToken);
    setServerSessionCookie(session);
    setServerAccessCookie("auth");

    await writeAuditLog("login", decoded.uid, { ip });

    return apiOk({ ok: true });
  } catch {
    return apiError(401, "SESSION_FAILED", GENERIC_ERROR);
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  clearServerAuthCookies();
  await writeAuditLog("logout", user?.uid ?? null);
  return apiOk({ ok: true });
}
