"use client";

import Image from "next/image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  fetchPriority,
  sizes = "(max-width: 768px) 100vw, 400px",
}: OptimizedImageProps) {
  if (!src) return null;

  const imgPriority = fetchPriority ?? (priority ? "high" : undefined);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={imgPriority}
        loading={priority ? undefined : "lazy"}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      sizes={sizes}
      priority={priority}
      fetchPriority={imgPriority}
      loading={priority ? undefined : "lazy"}
      className={className}
    />
  );
}
