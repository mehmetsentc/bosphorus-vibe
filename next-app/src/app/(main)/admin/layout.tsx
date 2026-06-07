import { redirect } from "next/navigation";
import { getSessionUser, getUserRole } from "@/lib/api/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    // Session cookie requires Firebase Admin env; client page enforces role when absent.
    return children;
  }

  const role = await getUserRole(user.uid);
  if (role !== "admin") {
    redirect("/home");
  }

  return children;
}
