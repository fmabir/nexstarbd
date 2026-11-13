"use client";

import { useUiText } from "@/components/i18n/ui-text";

import { Suspense } from "react";
import { MobileLogin } from "@/components/mobile/auth/MobileLogin";

export default function LoginPage() {
  const ui = useUiText();

  return <main id="main-content">
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={ui("Loading")} role="status" />
    </div>}>
      <MobileLogin />
    </Suspense>
  </main>;
}
