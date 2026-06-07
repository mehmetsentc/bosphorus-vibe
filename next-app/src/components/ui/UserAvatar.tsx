"use client";

import Image from "next/image";

type UserAvatarProps = {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function UserAvatar({
  src,
  name,
  size = 40,
  className = "",
  priority = false,
}: UserAvatarProps) {
  const initial = name[0]?.toUpperCase() || "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={`rounded-full object-cover ring-1 ring-border ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-surface-overlay font-bold ring-1 ring-border ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden={!name}
    >
      {initial}
    </div>
  );
}
