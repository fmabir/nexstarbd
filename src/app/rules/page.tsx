import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileRules } from "@/components/mobile/rules/MobileRules";

export default async function RulesPage() {
  const locale = await getLocale();
  const t = await getTranslations("rules");

  const sections = ["fairPlay", "squad", "match", "disqualification"] as const;
  const mobileSections = sections.map((s) => ({
    key: s,
    title: t(`${s}.title`),
    rules: t.raw(`${s}.rules`) as string[],
  }));

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content"><MobileRules title={t("title")} subtitle={t("subtitle")} sections={mobileSections} /></main>
      <Footer />
    </>
  );
}
