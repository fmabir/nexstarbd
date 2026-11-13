import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlayerHome } from "@/components/home/PlayerHome";
import { serialize } from "@/lib/utils/serialize";
import type { Winner, MvpPlayer, Tournament, Sponsor } from "@/lib/types";

async function getHomeData() {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");

    const [winnersSnap, mvpSnap, upcomingSnap, sponsorsSnap] = await Promise.all([
      adminDb.collection("winners").orderBy("tournamentDate", "desc").limit(12).get(),
      adminDb.collection("mvpPlayers").orderBy("tournamentDate", "desc").limit(4).get(),
      adminDb.collection("tournaments").where("status", "==", "upcoming").orderBy("startsAt", "asc").limit(3).get(),
      adminDb.collection("sponsors").get(),
    ]);

    return serialize({
      winners: winnersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Winner)),
      mvpPlayers: mvpSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as MvpPlayer)),
      upcomingTournaments: upcomingSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Tournament)),
      sponsors: sponsorsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Sponsor)),
    });
  } catch {
    return { winners: [], mvpPlayers: [], upcomingTournaments: [], sponsors: [] };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const { winners, mvpPlayers, upcomingTournaments, sponsors } = await getHomeData();

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content">
        <PlayerHome winners={winners} mvpPlayers={mvpPlayers} upcomingTournaments={upcomingTournaments} sponsors={sponsors} />
      </main>
      <Footer />
    </>
  );
}
