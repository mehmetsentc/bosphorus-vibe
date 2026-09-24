"use client";

import { usePathname } from "next/navigation";
import { isImmersiveVideoRoute } from "@/lib/utils/immersive-routes";

export function MainContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveVideoRoute(pathname);
  const akis = pathname === "/akis";

  return (
    <div
      className={
        akis
          ? "h-[100dvh] overflow-hidden md:h-auto md:min-h-screen md:overflow-visible"
          : immersive
            ? "h-[100dvh] overflow-hidden md:min-h-screen md:h-auto md:overflow-visible md:pb-0"
            : "min-h-screen pb-20 md:pb-0"
      }
    >
      {children}
    </div>
  );
}
