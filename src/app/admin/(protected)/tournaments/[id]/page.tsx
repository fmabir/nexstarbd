import { notFound } from "next/navigation";
import { ManageTournamentPanel } from "@/components/admin/ManageTournamentPanel";
import { serialize } from "@/lib/utils/serialize";
import type { Tournament, Registration, Announcement } from "@/lib/types";

async function getData(id: string) {
  const { adminDb } = await import("@/lib/firebase/admin");

  const [tournamentDoc, regsSnap, annSnap] = await Promise.all([
    adminDb.collection("tournaments").doc(id).get(),
    adminDb
      .collection("registrations")
      .where("tournamentId", "==", id)
      .orderBy("registeredAt", "asc")
      .get(),
    adminDb
      .collection("announcements")
      .where("tournamentId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get(),
  ]);

  if (!tournamentDoc.exists) return null;

  return serialize({
    tournament: { id: tournamentDoc.id, ...tournamentDoc.data() } as unknown as Tournament,
    registrations: regsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Registration)),
    announcements: annSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Announcement)),
  });
}

export default async function ManageTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  return <ManageTournamentPanel tournament={data.tournament} registrations={data.registrations} announcements={data.announcements} />;
}
