"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <h1 className="font-display text-xl font-bold text-[#D4AF37]">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-white/50">
        There was a problem loading the page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-2xl bg-gradient-to-br from-[#F0D875] to-[#D4AF37] px-6 py-3 text-sm font-semibold text-black"
      >
        Try again
      </button>
    </div>
  );
}
