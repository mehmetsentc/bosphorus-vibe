"use client";

import { useT } from "@/components/providers/I18nProvider";

type StoryRingProps = {
  label: string;
  photoUrl?: string;
  coverUrl?: string;
  hasUnviewed: boolean;
  isOwn?: boolean;
  showAdd?: boolean;
  onClick: () => void;
  onAddClick?: () => void;
};

export function StoryRing({
  label,
  photoUrl,
  coverUrl,
  hasUnviewed,
  isOwn,
  showAdd,
  onClick,
  onAddClick,
}: StoryRingProps) {
  const t = useT();

  const ringClass = hasUnviewed
    ? "bg-[conic-gradient(from(180deg),#D4AF37,#00D4FF,#f09433,#D4AF37)] p-[2.5px]"
    : "bg-muted/40 p-[2px]";

  const innerSrc = coverUrl || photoUrl;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-[72px] shrink-0 flex-col items-center gap-1"
    >
      <div className={`relative rounded-full ${ringClass}`}>
        <div className="rounded-full bg-background p-[2.5px]">
          <div className="relative h-[62px] w-[62px] overflow-hidden rounded-full bg-surface-overlay">
            {innerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={innerSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gold">
                {(label[0] ?? "?").toUpperCase()}
              </div>
            )}
          </div>
        </div>
        {isOwn && showAdd && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              (onAddClick ?? onClick)();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
                (onAddClick ?? onClick)();
              }
            }}
            className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-2 border-background bg-vibe text-xs font-bold text-black"
          >
            +
          </span>
        )}
      </div>
      <span className="max-w-[68px] truncate text-center text-[11px] text-foreground/90">
        {isOwn ? t("yourStory") : label}
      </span>
    </button>
  );
}
