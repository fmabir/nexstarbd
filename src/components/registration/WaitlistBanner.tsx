import { useTranslations } from "next-intl";

export function WaitlistBanner() {
  const t = useTranslations("registration");
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3">
      <span className="text-amber-500 text-xl shrink-0">⚠️</span>
      <p className="text-amber-800 text-sm font-medium">{t("waitlistBanner")}</p>
    </div>
  );
}
