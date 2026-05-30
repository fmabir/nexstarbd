import { type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const body = await request.json();
    const { tournamentId, tournamentName, squadName, players, prize, position, photoUrl, tournamentDate } = body;

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (tournamentId !== undefined) updates.tournamentId = tournamentId;
    if (tournamentName !== undefined) updates.tournamentName = tournamentName;
    if (squadName !== undefined) updates.squadName = squadName;
    if (players !== undefined) updates.players = players;
    if (prize !== undefined) updates.prize = prize;
    if (position !== undefined) updates.position = Number(position);
    if (photoUrl !== undefined) updates.photoUrl = photoUrl || null;
    if (tournamentDate !== undefined) updates.tournamentDate = Timestamp.fromDate(new Date(tournamentDate));

    await adminDb.collection("winners").doc(id).update(updates);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
