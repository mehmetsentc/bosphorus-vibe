"use client";

type UploadSettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  description?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (next: boolean) => void;
  badge?: boolean;
};

export function UploadSettingRow({
  icon,
  label,
  value,
  description,
  onClick,
  toggle,
  toggleValue = false,
  onToggle,
  badge,
}: UploadSettingRowProps) {
  const interactive = Boolean(onClick) || Boolean(toggle);

  return (
    <div className="border-b border-white/[0.08] py-3.5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg text-white/90">
          {icon}
        </span>
        {toggle ? (
          <button
            type="button"
            onClick={() => onToggle?.(!toggleValue)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
          >
            <span className="text-[15px] text-white">{label}</span>
            <span
              className={`relative h-[30px] w-[50px] shrink-0 rounded-full transition ${
                toggleValue ? "bg-[#0095f6]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-[3px] h-[24px] w-[24px] rounded-full bg-white shadow transition ${
                  toggleValue ? "left-[23px]" : "left-[3px]"
                }`}
              />
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled={!interactive}
            onClick={onClick}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left disabled:cursor-default"
          >
            <span className="text-[15px] text-white">{label}</span>
            <span className="flex shrink-0 items-center gap-2 text-white/45">
              {value && <span className="max-w-[120px] truncate text-sm">{value}</span>}
              {badge && <span className="h-2 w-2 rounded-full bg-[#0095f6]" />}
              {onClick && <span className="text-xl leading-none">›</span>}
            </span>
          </button>
        )}
      </div>
      {description && (
        <p className="mt-2 pl-9 text-xs leading-relaxed text-white/45">{description}</p>
      )}
    </div>
  );
}
