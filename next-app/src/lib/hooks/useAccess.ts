"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { getAccessCookie } from "@/lib/session/cookies";
import { useEffect, useState } from "react";

export function useAccess() {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    setGuestMode(getAccessCookie() === "guest" && !user);
  }, [user]);

  const isAuthenticated = Boolean(user);
  const isGuest = guestMode && !isAuthenticated;
  const hasAppAccess = isAuthenticated || isGuest;

  return {
    user,
    loading,
    isAuthenticated,
    isGuest,
    hasAppAccess,
    canLike: isAuthenticated,
    canComment: isAuthenticated,
    canUpload: isAuthenticated,
  };
}
