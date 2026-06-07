"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/components/providers/I18nProvider";

function IconBack({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

type SettingsScreenProps = {
  title: string;
  backHref?: string;
  children: React.ReactNode;
};

export function SettingsScreen({
  title,
  backHref = "/profile/settings",
  children,
}: SettingsScreenProps) {
  const router = useRouter();
  const t = useT();

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24 md:pb-8">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          aria-label={t("back")}
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="rounded-lg p-1.5 transition hover:bg-surface-overlay"
        >
          <IconBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-base font-semibold">{title}</h1>
        <div className="w-9" aria-hidden />
      </header>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {title && (
        <h2 className="px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </h2>
      )}
      <div className="divide-y divide-border border-y border-border bg-background">
        {children}
      </div>
    </section>
  );
}

type SettingsRowProps = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
};

export function SettingsRow({
  icon,
  label,
  value,
  href,
  onClick,
  destructive,
}: SettingsRowProps) {
  const className = `flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-surface-overlay/60 ${
    destructive ? "text-red-400" : "text-foreground"
  }`;

  const inner = (
    <>
      {icon && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-[15px]">{label}</span>
      {value && (
        <span className="shrink-0 text-sm text-muted">{value}</span>
      )}
      {(href || onClick) && (
        <span className="shrink-0 text-muted" aria-hidden>
          ›
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function SettingsToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 px-4 py-3.5 transition hover:bg-surface-overlay/60">
      {icon && (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] text-foreground">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">
            {description}
          </span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-gold"
      />
    </label>
  );
}

export function SettingsChoiceRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-surface-overlay/60"
    >
      <span className="text-[15px]">{label}</span>
      {selected && (
        <span className="text-gold" aria-hidden>
          ✓
        </span>
      )}
    </button>
  );
}

export function SettingsInfoBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="px-4 py-3 text-xs leading-relaxed text-muted">{children}</p>
  );
}

export function SettingsUserList({
  users,
  emptyLabel,
  onRemove,
}: {
  users: { uid: string; userName: string }[];
  emptyLabel: string;
  onRemove: (uid: string) => void;
}) {
  if (users.length === 0) {
    return <SettingsInfoBlock>{emptyLabel}</SettingsInfoBlock>;
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {users.map((u) => (
        <div
          key={u.uid}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <span className="text-[15px]">@{u.userName}</span>
          <button
            type="button"
            onClick={() => onRemove(u.uid)}
            className="text-sm text-red-400 transition hover:text-red-300"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

