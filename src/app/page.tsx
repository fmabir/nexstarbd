import { getTranslations, getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { UpcomingTournaments } from "@/components/home/UpcomingTournaments";
import { AnnouncementsFeed } from "@/components/home/AnnouncementsFeed";
import { HallOfFamePreview } from "@/components/home/HallOfFamePreview";
import { MvpShowcase } from "@/components/home/MvpShowcase";
import { SponsorsSection } from "@/components/home/SponsorsSection";
import { CommunityLinks } from "@/components/home/CommunityLinks";
import type { Winner, MvpPlayer, Sponsor } from "@/lib/types";

async function getHomeData() {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const [winnersSnap, mvpSnap, sponsorsSnap] = await Promise.all([
      adminDb
        .collection("winners")
        .orderBy("tournamentDate", "desc")
        .limit(6)
        .get(),
      adminDb
        .collection("mvpPlayers")
        .orderBy("tournamentDate", "desc")
        .limit(6)
        .get(),
      adminDb
        .collection("sponsors")
        .where("isActive", "==", true)
        .orderBy("displayOrder", "asc")
        .get(),
    ]);

    return {
      winners: winnersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Winner)),
      mvpPlayers: mvpSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as MvpPlayer)),
      sponsors: sponsorsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Sponsor)),
    };
  } catch {
    return { winners: [], mvpPlayers: [], sponsors: [] };
  }
}

export default async function HomePage() {
  const t = await getTranslations("hero");
  const locale = await getLocale();
  const { winners, mvpPlayers, sponsors } = await getHomeData();

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <HeroSection
          title={t("title")}
          subtitle={t("subtitle")}
          ctaRegister={t("cta_register")}
          ctaWinners={t("cta_winners")}
        />
        <UpcomingTournaments />
        <AnnouncementsFeed />
        <HallOfFamePreview winners={winners} />
        <MvpShowcase players={mvpPlayers} />
        <SponsorsSection sponsors={sponsors} />
        <CommunityLinks />
      </main>
      <Footer />
    </>
  );
}
