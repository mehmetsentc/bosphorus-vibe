import { getAdminDb } from "@/lib/firebase/admin";

export type AuditAction =
  | "login"
  | "logout"
  | "upload"
  | "delete_account"
  | "export_data"
  | "admin_delete_post"
  | "admin_update_event"
  | "api_error";

export async function writeAuditLog(
  action: AuditAction,
  uid: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection("audit_logs").add({
      action,
      uid,
      meta: meta ?? {},
      createdAt: new Date(),
    });
  } catch {
    // Never block user flows on audit failure
  }
}
