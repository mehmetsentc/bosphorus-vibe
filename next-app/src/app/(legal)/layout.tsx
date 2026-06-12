import { LegalFooter } from "@/components/layout/LegalFooter";

export const dynamic = "force-static";
export const revalidate = 86400;

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">{children}</div>
      <LegalFooter className="border-t border-border" />
    </div>
  );
}
