import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileMyRegistration } from "@/components/mobile/registration/MobileMyRegistration";
import { serialize } from "@/lib/utils/serialize";
import type { Registration, Tournament, Announcement } from "@/lib/types";
import { getSessionUser } from "@/lib/server/session";
import { isAdminEmail } from "@/lib/server/auth";
import { getRoomInfo, withPrivateFields, withoutRoom } from "@/lib/server/privateData";

/**
 * A registration page shows the squad's WhatsApp, bKash and transaction ID,
 * and the room once approved, so only its own player (or an admin) may open it.
 */
async function getData(registrationId: string, viewer: { uid: string; email?: string }) {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");

    const regDoc = await adminDb.collection("registrations").doc(registrationId).get();
    if (!regDoc.exists) return null;
    if (regDoc.get("userId") !== viewer.uid && !isAdminEmail(viewer.email)) return null;

    const [reg] = await withPrivateFields(adminDb, [{ id: regDoc.id, ...regDoc.data() } as unknown as Registration]);

    const [tournamentDoc, announcementsSnap] = await Promise.all([
      adminDb.collection("tournaments").doc(reg.tournamentId).get(),
      adminDb
        .collection("announcements")
        .where("tournamentId", "==", reg.tournamentId)
        .orderBy("isPinned", "desc")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get(),
    ]);

    return serialize({
      registration: reg,
      tournament: tournamentDoc.exists
        ? ({
            ...withoutRoom({ id: tournamentDoc.id, ...tournamentDoc.data() } as unknown as Tournament),
            ...(reg.approvalStatus === "approved" ? await getRoomInfo(adminDb, tournamentDoc.id, tournamentDoc.data()) : {}),
          } as Tournament)
        : null,
      announcements: announcementsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Announcement)),
    });
  } catch {
    return null;
  }
}

export default async function MyRegistrationPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const viewer = await getSessionUser();
  if (!viewer) redirect(`/login?next=/my-registration/${registrationId}`);

  const locale = await getLocale();
  const data = await getData(registrationId, viewer);

  if (!data) notFound();

  const { registration: reg, tournament, announcements } = data;

  return (
    <>
      <Navbar locale={locale} />
      <main id="main-content">
        <MobileMyRegistration registration={reg} tournament={tournament} announcements={announcements} />
      </main>
      <Footer />
    </>
  );
}
