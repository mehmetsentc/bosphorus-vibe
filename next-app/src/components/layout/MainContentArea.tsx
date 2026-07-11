"use client";

import { usePathname } from "next/navigation";
import { isImmersiveVideoRoute } from "@/lib/utils/immersive-routes";

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveVideoRoute(pathname);

  return (
    <div
      className={
        immersive
          ? "h-[100dvh] overflow-hidden md:min-h-screen md:h-auto md:overflow-visible md:pb-0"
          : "min-h-screen pb-20 md:pb-0"
      }
    >
      {children}
    </div>
  );
}
