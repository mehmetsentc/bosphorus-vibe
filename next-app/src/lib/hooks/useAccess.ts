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

  const isAnonymous = Boolean(user?.isAnonymous);
  const isAuthenticated = Boolean(user) && !isAnonymous;
  const isGuest = (guestMode && !user) || isAnonymous;
  const hasAppAccess = Boolean(user) || isGuest;

  return {
    user,
    loading,
    isAuthenticated,
    isGuest,
    isAnonymous,
    hasAppAccess,
    canLike: isAuthenticated,
    canComment: isAuthenticated,
    canUpload: isAuthenticated,
  };
}
