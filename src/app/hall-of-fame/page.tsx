import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileHallOfFame } from "@/components/mobile/hall-of-fame/MobileHallOfFame";
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
      <main id="main-content"><MobileHallOfFame title={t("title")} subtitle={t("subtitle")} emptyText={t("noWinners")} winners={winners} /></main>
      <Footer />
    </>
  );
}
