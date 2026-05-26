"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    const next = currentLocale === "en" ? "bn" : "en";
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
      title={currentLocale === "en" ? "Switch to Bangla" : "Switch to English"}
    >
      <span className="text-base">{currentLocale === "en" ? "🇧🇩" : "🇬🇧"}</span>
      <span className="text-foreground">{currentLocale === "en" ? "বাংলা" : "EN"}</span>
    </button>
  );
}
