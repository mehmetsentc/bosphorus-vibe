"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccess } from "@/lib/hooks/useAccess";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useT } from "@/components/providers/I18nProvider";

const StoryPostComposer = dynamic(
  () =>
    import("@/components/stories/StoryPostComposer").then((m) => ({
      default: m.StoryPostComposer,
    })),
  { ssr: false },
);

type ShareToStoryButtonProps = {
  postId: string;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  onSuccess?: () => void;
  onToast?: (message: string) => void;
};

export function ShareToStoryButton({
  postId,
  className = "",
  showLabel = false,
  labelClassName = "",
  onSuccess,
  onToast,
}: ShareToStoryButtonProps) {
  const t = useT();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { canUpload } = useAccess();
  const { prefs } = useSettings();
  const [open, setOpen] = useState(false);

  if (!prefs.allowSharing) return null;

  const photo = profile?.photo_url || user?.photoURL || "";

  function handleClick() {
    if (!canUpload) {
      router.push("/welcome?reason=auth-required");
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        aria-label={t("shareStory")}
        onClick={handleClick}
        className={className}
      >
        {showLabel ? (
          <span className={`flex flex-col items-center gap-1.5 ${labelClassName}`}>
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[conic-gradient(from(180deg),#D4AF37,#00D4FF,#f09433,#D4AF37)] p-[2px]">
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-background">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-vibe">+</span>
                  )}
                </span>
              </span>
            </span>
            <span className="max-w-[5.5rem] truncate text-center text-[11px] font-semibold">
              {t("shareStoryShort")}
            </span>
          </span>
        ) : (
          <span className="relative inline-flex h-[26px] w-[26px] items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[conic-gradient(from(180deg),#D4AF37,#00D4FF,#f09433,#D4AF37)] p-[1.5px]">
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-background">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-vibe">+</span>
                )}
              </span>
            </span>
          </span>
        )}
      </button>

      <StoryPostComposer
        open={open}
        postId={postId}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
        onToast={onToast}
      />
    </>
  );
}
