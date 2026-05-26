import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const icons: Record<string, string> = {
  fairPlay: "⚖️",
  squad: "👥",
  match: "🎮",
  disqualification: "🚫",
};

export default async function RulesPage() {
  const locale = await getLocale();
  const t = await getTranslations("rules");

  const sections = ["fairPlay", "squad", "match", "disqualification"] as const;

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted">
        {/* Header */}
        <div className="bg-gray-900 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide mb-3">
              {t("title")}
            </h1>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          {sections.map((section) => {
            const rules = t.raw(`${section}.rules`) as string[];
            return (
              <div
                key={section}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <span className="text-2xl">{icons[section]}</span>
                  <h2 className="font-display text-2xl text-foreground tracking-wide">
                    {t(`${section}.title`)}
                  </h2>
                </div>
                <ul className="divide-y divide-border">
                  {rules.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 px-6 py-4">
                      <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{rule}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="bg-secondary-light border border-secondary/20 rounded-2xl px-6 py-5 text-center">
            <p className="text-secondary-dark font-semibold">
              🏆 Good luck to all participants! Play fair, play hard.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
