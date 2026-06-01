import { notFound } from "next/navigation";
import { ManageTournamentPanel } from "@/components/admin/ManageTournamentPanel";
import { serialize } from "@/lib/utils/serialize";
import type { Tournament, Registration, Announcement } from "@/lib/types";

async function getData(id: string) {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");

    const [tournamentDoc, regsSnap, annSnap] = await Promise.all([
      adminDb.collection("tournaments").doc(id).get(),
      adminDb.collection("registrations").where("tournamentId", "==", id).get(),
      adminDb.collection("announcements").where("tournamentId", "==", id).limit(20).get(),
    ]);

    if (!tournamentDoc.exists) return null;

    const registrations = regsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as unknown as Registration))
      .sort((a, b) => {
        const aMs = (a.registeredAt as unknown as { seconds?: number })?.seconds ?? 0;
        const bMs = (b.registeredAt as unknown as { seconds?: number })?.seconds ?? 0;
        return aMs - bMs;
      });

    const announcements = annSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as unknown as Announcement))
      .sort((a, b) => {
        const aMs = (a.createdAt as unknown as { seconds?: number })?.seconds ?? 0;
        const bMs = (b.createdAt as unknown as { seconds?: number })?.seconds ?? 0;
        return bMs - aMs;
      });

    return serialize({
      tournament: { id: tournamentDoc.id, ...tournamentDoc.data() } as unknown as Tournament,
      registrations,
      announcements,
    });
  } catch (err) {
    console.error("getData error:", err);
    return null;
  }
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
