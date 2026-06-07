"use client";

import { useParams } from "next/navigation";
import { ProfilePostsFeedView } from "@/components/profile/ProfilePostsFeedView";

export default function UserProfilePostFeedPage() {
  const params = useParams<{ uid: string; id: string }>();
  const uid = params.uid;

  if (!uid) return null;

  return <ProfilePostsFeedView uid={uid} backHref={`/user/${uid}`} />;
}
