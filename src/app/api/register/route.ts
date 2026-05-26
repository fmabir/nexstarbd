import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tournamentId = searchParams.get("tournamentId");
  if (!tournamentId) {
    return Response.json({ error: "Missing tournamentId" }, { status: 400 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const tournamentDoc = await adminDb.collection("tournaments").doc(tournamentId).get();
    if (!tournamentDoc.exists) {
      return Response.json({ error: "Tournament not found" }, { status: 404 });
    }
    const data = tournamentDoc.data()!;
    return Response.json({
      allUids: data.allUids || [],
      registeredCount: data.registeredCount || 0,
      maxSlots: data.maxSlots || 12,
      isRegistrationOpen: data.isRegistrationOpen,
      status: data.status,
    });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tournamentId, squadName, contactNumber, players } = body;

  if (!tournamentId || !squadName || !contactNumber || !players?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const newUids: string[] = players
    .map((p: { uid: string }) => p.uid?.trim())
    .filter(Boolean);

  if (newUids.length === 0) {
    return Response.json({ error: "At least one player UID is required" }, { status: 400 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const tournamentRef = adminDb.collection("tournaments").doc(tournamentId);

    const result = await adminDb.runTransaction(async (tx) => {
      const tournamentDoc = await tx.get(tournamentRef);
      if (!tournamentDoc.exists) {
        throw new Error("TOURNAMENT_NOT_FOUND");
      }

      const data = tournamentDoc.data()!;

      if (!data.isRegistrationOpen) {
        throw new Error("REGISTRATION_CLOSED");
      }

      if (data.status !== "upcoming") {
        throw new Error("REGISTRATION_CLOSED");
      }

      // Check duplicate UIDs
      const existingUids: string[] = data.allUids || [];
      const duplicateUid = newUids.find((uid) => existingUids.includes(uid));
      if (duplicateUid) {
        throw new Error(`DUPLICATE_UID:${duplicateUid}`);
      }

      const registeredCount = data.registeredCount || 0;
      const maxSlots = data.maxSlots || 12;
      const isWaitlisted = registeredCount >= maxSlots;
      const slotNumber = isWaitlisted ? null : registeredCount + 1;

      const regRef = adminDb.collection("registrations").doc();
      tx.set(regRef, {
        tournamentId,
        squadName: squadName.trim(),
        players: players.map((p: { ign: string; uid: string }, i: number) => ({
          ign: p.ign?.trim() || "",
          uid: p.uid?.trim() || "",
          isCaptain: i === 0,
        })),
        contactNumber: contactNumber.trim(),
        slotNumber,
        isWaitlisted,
        status: isWaitlisted ? "waitlisted" : "confirmed",
        registeredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.update(tournamentRef, {
        allUids: FieldValue.arrayUnion(...newUids),
        registeredCount: FieldValue.increment(1),
        waitlistCount: isWaitlisted
          ? FieldValue.increment(1)
          : data.waitlistCount || 0,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { isWaitlisted, slotNumber };
    });

    return Response.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SERVER_ERROR";

    if (msg === "TOURNAMENT_NOT_FOUND") {
      return Response.json({ error: "Tournament not found" }, { status: 404 });
    }
    if (msg === "REGISTRATION_CLOSED") {
      return Response.json({ error: "Registration is closed" }, { status: 409 });
    }
    if (msg.startsWith("DUPLICATE_UID")) {
      return Response.json(
        { error: "A player UID is already registered in this tournament" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
