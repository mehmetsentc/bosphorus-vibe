import Image from "next/image";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: { w: 48, h: 48, tagline: "text-[8px]" },
  md: { w: 80, h: 80, tagline: "text-[10px]" },
  lg: { w: 140, h: 140, tagline: "text-xs" },
  xl: { w: 200, h: 200, tagline: "text-sm" },
};

export function Logo({ size = "md", showTagline = false, className = "" }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: s.w, height: s.h }}>
        <Image
          src="/logo.png"
          alt="Bosphorus Vibe"
          width={s.w}
          height={s.h}
          priority
          className="object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.3)]"
        />
      </div>
      {showTagline && (
        <p className={`mt-2 font-medium tracking-[0.25em] vibe-text ${s.tagline}`}>
          FEEL THE VIBE
        </p>
      )}
    </div>
  );
}

export function LogoMark({
  className = "h-8 w-8",
  prominent = false,
}: {
  className?: string;
  prominent?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Bosphorus Vibe"
      width={128}
      height={128}
      priority
      className={`object-contain ${
        prominent
          ? "drop-shadow-[0_0_18px_rgba(212,175,55,0.55)] brightness-110"
          : ""
      } ${className}`}
    />
  );
}
