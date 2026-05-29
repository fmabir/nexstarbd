"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PreviewBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  if (searchParams.get("preview") !== "admin") return null;

  return (
    <>
      {/* Spacer so page content isn't hidden under the bar */}
      <div style={{ height: "40px" }} />
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-gray-900 border-b-2 border-primary flex items-center justify-between px-4" style={{ height: "40px" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-white text-xs font-semibold tracking-wide">Admin Preview Mode</span>
          <span className="text-gray-400 text-xs hidden sm:inline">— viewing as a regular member</span>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Exit Preview
        </button>
      </div>
    </>
  );
}

export function AdminPreviewBar() {
  return (
    <Suspense fallback={null}>
      <PreviewBar />
    </Suspense>
  );
}
