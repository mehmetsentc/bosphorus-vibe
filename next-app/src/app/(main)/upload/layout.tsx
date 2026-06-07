export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black md:left-[244px] md:right-0">
      {children}
    </div>
  );
}
