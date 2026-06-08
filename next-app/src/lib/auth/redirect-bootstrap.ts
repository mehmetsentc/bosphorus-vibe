import { ensureAuthReady } from "@/lib/firebase";
import { completeGoogleRedirectSignIn } from "@/lib/services/auth";

/** Run as early as possible after the client bundle loads (before React mounts). */
if (typeof window !== "undefined") {
  void (async () => {
    try {
      await ensureAuthReady();
      await completeGoogleRedirectSignIn();
    } catch (err) {
      console.error("[auth] redirect bootstrap failed:", err);
    }
  })();
}
