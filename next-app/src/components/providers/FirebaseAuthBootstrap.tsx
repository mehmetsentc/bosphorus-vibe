"use client";

import { useEffect } from "react";
import { completeGoogleRedirectSignIn } from "@/lib/services/auth";

/** Run redirect completion as early as possible (before dynamic provider chunks). */
export function FirebaseAuthBootstrap() {
  useEffect(() => {
    void completeGoogleRedirectSignIn();
  }, []);

  return null;
}
