import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <h1 className="font-display text-2xl font-bold gold-text">404</h1>
      <p className="text-sm text-white/50">Page not found</p>
      <Link
        href="/home"
        className="rounded-2xl gold-gradient px-6 py-3 text-sm font-semibold text-black"
      >
        Back to home
      </Link>
    </div>
  );
}
