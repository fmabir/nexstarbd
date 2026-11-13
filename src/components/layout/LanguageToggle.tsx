"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageToggle({ currentLocale }: { currentLocale?: string }) {
  const detectedLocale = useLocale();
  const locale = currentLocale ?? detectedLocale;
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const next = locale === "bn" ? "en" : "bn";
  return <button type="button" disabled={pending} onClick={() => {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  }} lang={next} aria-label={next === "bn" ? "বাংলায় দেখুন" : "Switch to English"} className="inline-flex min-h-10 min-w-11 items-center justify-center rounded-xl border border-border bg-white px-2.5 text-[13px] font-semibold text-foreground hover:bg-primary-light disabled:opacity-50">{pending ? "…" : next === "bn" ? "বাংলা" : "EN"}</button>;
}
