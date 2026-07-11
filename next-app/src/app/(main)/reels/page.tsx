import { redirect } from "next/navigation";

/** Legacy /reels tab URL — reels live in feed + /feed/[postId] fullscreen. */
export default function ReelsRedirectPage() {
  redirect("/home");
}
