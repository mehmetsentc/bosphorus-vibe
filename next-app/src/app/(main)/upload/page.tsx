import dynamic from "next/dynamic";

// 732-line component — only needed on upload page, load lazily
const CreateUploadFlow = dynamic(
  () => import("@/components/upload/CreateUploadFlow").then((m) => ({ default: m.CreateUploadFlow })),
  { ssr: false },
);

export default function UploadPage() {
  return <CreateUploadFlow />;
}
