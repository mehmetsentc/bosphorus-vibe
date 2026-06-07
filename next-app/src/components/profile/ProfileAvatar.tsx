"use client";

import { IconPlus } from "@/components/icons/Icons";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useT } from "@/components/providers/I18nProvider";

type ProfileAvatarProps = {
  photoUrl: string;
  displayName: string;
  note?: string;
  onChangePhoto?: () => void;
  size?: "md" | "lg";
};

const sizes = {
  md: 86,
  lg: 150,
};

export function ProfileAvatar({
  photoUrl,
  displayName,
  note,
  onChangePhoto,
  size = "md",
}: ProfileAvatarProps) {
  const t = useT();
  const pixelSize = sizes[size];

  return (
    <div className="relative shrink-0">
      {note && size === "md" && (
        <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap md:hidden">
          <div className="relative rounded-2xl border border-border bg-surface-overlay px-3 py-1.5 text-[11px] font-medium shadow-sm">
            {note.length > 18 ? `${note.slice(0, 18)}…` : note}
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-border bg-surface-overlay"
            />
          </div>
        </div>
      )}

      <div className="relative">
        <UserAvatar
          src={photoUrl}
          name={displayName}
          size={pixelSize}
          priority={size === "lg"}
          className="ring-1 ring-border"
        />

        {onChangePhoto && (
          <button
            type="button"
            aria-label={t("changeProfilePhoto")}
            onClick={onChangePhoto}
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-vibe text-background md:h-8 md:w-8"
          >
            <IconPlus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
