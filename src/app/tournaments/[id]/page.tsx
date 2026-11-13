import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { serialize } from "@/lib/utils/serialize";
import { getSessionUser } from "@/lib/server/session";
import { getRoomInfo, withPrivateFields, withoutRoom } from "@/lib/server/privateData";
import type { Tournament, Registration } from "@/lib/types";
import { MobileTournamentDetail } from "@/components/mobile/tournaments/MobileTournamentDetail";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();

  let tournament: Tournament | null = null;
  let myRegistration: Registration | null = null;

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const doc = await adminDb.collection("tournaments").doc(id).get();
    if (doc.exists) {
      // Never hand room details to the page unless this squad is approved (below)
      tournament = withoutRoom(serialize({ id: doc.id, ...doc.data() } as unknown as Tournament));
    }

    if (tournament) {
      const sessionUser = await getSessionUser();
      if (sessionUser) {
        const snap = await adminDb
          .collection("registrations")
          .where("tournamentId", "==", id)
          .where("userId", "==", sessionUser.uid)
          .limit(1)
          .get();
        if (!snap.empty) {
          // Their own squad, so include its contact and payment details
          const [mine] = await withPrivateFields(adminDb, [{ id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as Registration]);
          myRegistration = serialize(mine);
        }
      }
    }

    if (tournament && myRegistration?.approvalStatus === "approved") {
      tournament = { ...tournament, ...(await getRoomInfo(adminDb, id, doc.data())) };
    }
  } catch {}

  if (!tournament) notFound();

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content"><MobileTournamentDetail tournament={tournament} myRegistration={myRegistration} /></main>
      <Footer />
    </>
  );
}
