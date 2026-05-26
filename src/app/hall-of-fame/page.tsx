import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WinnerCard } from "@/components/hall-of-fame/WinnerCard";
import type { Winner } from "@/lib/types";

async function getWinners(): Promise<Winner[]> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb
      .collection("winners")
      .orderBy("tournamentDate", "desc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Winner));
  } catch {
    return [];
  }
}

export default async function HallOfFamePage() {
  const locale = await getLocale();
  const t = await getTranslations("hallOfFame");
  const winners = await getWinners();

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-muted">
        {/* Header */}
        <div className="bg-gray-900 text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-5xl sm:text-6xl tracking-wide mb-3">
              {t("title")}
            </h1>
            <p className="text-gray-400">{t("subtitle")}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {winners.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🏆</p>
              <p className="text-muted-foreground">{t("noWinners")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((w) => (
                <WinnerCard key={w.id} winner={w} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
