import { getAdminDb } from "@/lib/firebase/admin";

export type AuditAction =
  | "login"
  | "logout"
  | "upload"
  | "delete_account"
  | "export_data"
  | "admin_delete_post"
  | "admin_create_event"
  | "admin_update_event"
  | "admin_update_user_role"
  | "admin_transcode_enqueue"
  | "admin_transcode_run"
  | "admin_thumbnail_enqueue"
  | "admin_thumbnail_run"
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
