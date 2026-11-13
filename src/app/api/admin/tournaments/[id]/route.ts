import { type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { deleteRoomInfo, setRoomInfo } from "@/lib/server/privateData";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const body = await request.json();
    const { adminDb } = await import("@/lib/firebase/admin");

    const allowed = [
      "status",
      "isRegistrationOpen",
      "name",
      "description",
      "prizePool",
      "maxSlots",
      "firstPrize",
      "secondPrize",
      "bkashNumber",
      "bannerUrl",
    ];

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    if (body.startsAt) update.startsAt = Timestamp.fromDate(new Date(body.startsAt));
    if (body.registrationDeadline) update.registrationDeadline = Timestamp.fromDate(new Date(body.registrationDeadline));

    await adminDb.collection("tournaments").doc(id).update(update);

    // Room details never go on the public tournament document
    if ("roomId" in body || "roomPassword" in body) {
      await setRoomInfo(adminDb, id, {
        ...("roomId" in body ? { roomId: body.roomId || null } : {}),
        ...("roomPassword" in body ? { roomPassword: body.roomPassword || null } : {}),
      });
    }
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg === "Unauthorized") return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "Forbidden") return Response.json({ error: "Forbidden" }, { status: 403 });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb.collection("tournaments").doc(id).delete();
    await deleteRoomInfo(adminDb, id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
