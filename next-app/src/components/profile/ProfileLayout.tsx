"use client";

import type { ReactNode } from "react";
import { ProfileAvatar } from "./ProfileAvatar";

type ProfileStatProps = {
  value: number | string;
  label: string;
};

export function ProfileStat({ value, label }: ProfileStatProps) {
  return (
    <div className="text-center md:text-left">
      <span className="font-semibold">{value}</span>{" "}
      <span className="text-sm">{label}</span>
    </div>
  );
}

type ProfileStatsRowProps = {
  stats: ProfileStatProps[];
  className?: string;
};

export function ProfileStatsRow({ stats, className = "" }: ProfileStatsRowProps) {
  return (
    <div
      className={`flex flex-1 items-center justify-around gap-1 sm:gap-2 md:flex-none md:justify-start md:gap-10 ${className}`}
    >
      {stats.map((stat) => (
        <ProfileStat key={stat.label} {...stat} />
      ))}
    </div>
  );
}

type ProfileLayoutProps = {
  username: string;
  displayName: string;
  photoUrl: string;
  bio?: ReactNode;
  stats: ProfileStatProps[];
  actions: ReactNode;
  avatarNote?: string;
  onChangePhoto?: () => void;
  menu?: ReactNode;
  highlights?: ReactNode;
  tabs: ReactNode;
  children: ReactNode;
  backLink?: ReactNode;
};

export function ProfileLayout({
  username,
  displayName,
  photoUrl,
  bio,
  stats,
  actions,
  avatarNote,
  onChangePhoto,
  menu,
  highlights,
  tabs,
  children,
  backLink,
}: ProfileLayoutProps) {
  const handle = username.replace(/\s+/g, "").toLowerCase();

  return (
    <div className="mx-auto w-full max-w-[935px] pb-6">
      <header className="sticky top-0 z-30 flex items-center border-b border-border bg-background px-4 py-2.5 md:hidden">
        {backLink ?? <div className="w-8" />}
        <h1 className="flex-1 text-center text-base font-semibold">{handle}</h1>
        {menu ?? <div className="w-8" />}
      </header>

      {backLink && (
        <div className="hidden px-4 pt-4 md:block">{backLink}</div>
      )}

      <div className="px-4 pt-4 md:px-0 md:pt-8">
        {/* Mobile: avatar + stats row */}
        <div className="flex items-center gap-6 md:hidden">
          <ProfileAvatar
            photoUrl={photoUrl}
            displayName={displayName}
            note={avatarNote}
            onChangePhoto={onChangePhoto}
            size="md"
          />
          <ProfileStatsRow stats={stats} />
        </div>

        {/* Desktop: avatar left, info right */}
        <div className="hidden md:flex md:items-start md:gap-8 lg:gap-12">
          <div className="shrink-0 pt-2">
            <ProfileAvatar
              photoUrl={photoUrl}
              displayName={displayName}
              onChangePhoto={onChangePhoto}
              size="lg"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-xl">{handle}</h2>
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
              {menu}
            </div>
            <div className="mt-5">
              <ProfileStatsRow stats={stats} />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">{displayName}</p>
              {bio && <div className="mt-1 text-sm leading-snug">{bio}</div>}
            </div>
            {highlights && <div className="mt-4">{highlights}</div>}
          </div>
        </div>

        {/* Mobile: name, bio, actions */}
        <div className="mt-3 md:hidden">
          <p className="text-sm font-semibold">{displayName}</p>
          {bio && <div className="mt-1 text-sm leading-snug">{bio}</div>}
          <div className="mt-3 flex flex-wrap gap-1.5">{actions}</div>
          {highlights && <div className="mt-4">{highlights}</div>}
        </div>
      </div>

      <div className="mt-2 border-t border-border md:mt-6">{tabs}</div>
      <div className="-mx-4 sm:mx-0">{children}</div>
    </div>
  );
}

export { ProfileAvatar };
