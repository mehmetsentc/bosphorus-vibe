import {
  getPostCaption,
  getPostImageUrl,
} from "@/lib/services/firestore";
import { BRAND_NAME } from "@/lib/brand";
import type { SharePayload } from "@/components/share/ShareSheet";
import type { UserPostDoc } from "@/types";

export function buildPostSharePayload(post: UserPostDoc): SharePayload {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const caption = getPostCaption(post);

  return {
    url: `${origin}/post/${post.id}`,
    title: caption || BRAND_NAME,
    text: caption || BRAND_NAME,
    thumbnail: post.postVideothumbnail || getPostImageUrl(post) || undefined,
    postId: post.id,
  };
}
