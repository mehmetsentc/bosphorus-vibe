import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionUser, getUserRole } from "@/lib/api/auth";

export default async function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user) {
    const role = await getUserRole(user.uid);
    if (role !== "admin") redirect("/home");
  }

  return <AdminShell>{children}</AdminShell>;
}
