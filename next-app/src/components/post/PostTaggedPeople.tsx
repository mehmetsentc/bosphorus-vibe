"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useT } from "@/components/providers/I18nProvider";
import type { PostTag } from "@/types";

type PostTaggedPeopleProps = {
  tags?: PostTag[];
  className?: string;
  prefix?: boolean;
  lightText?: boolean;
};

export function PostTaggedPeople({
  tags = [],
  className = "",
  prefix = true,
  lightText = false,
}: PostTaggedPeopleProps) {
  const t = useT();
  if (!tags.length) return null;

  const linkClass = lightText
    ? "font-semibold text-white hover:underline"
    : "font-semibold text-vibe hover:underline";

  return (
    <p className={className}>
      {prefix && (
        <span className={lightText ? "text-white/85" : "text-foreground/90"}>
          {t("taggedWith")}{" "}
        </span>
      )}
      {tags.map((tag, index) => (
        <Fragment key={tag.uid}>
          {index > 0 && (
            <span className={lightText ? "text-white/85" : "text-foreground/90"}>
              {index === tags.length - 1 ? ` ${t("tagAnd")} ` : ", "}
            </span>
          )}
          <Link href={`/user/${tag.uid}`} className={linkClass}>
            @{tag.userName}
          </Link>
        </Fragment>
      ))}
    </p>
  );
}
