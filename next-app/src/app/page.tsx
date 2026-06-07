import { redirect } from "next/navigation";

/** Root route — middleware also redirects; this is the static build fallback. */
export default function RootPage() {
  redirect("/welcome");
}
