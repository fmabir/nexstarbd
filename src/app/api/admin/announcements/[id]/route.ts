import { type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const body = await request.json();
    const { title, body: msgBody, type, tournamentId, isPinned } = body;

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title || null;
    if (msgBody !== undefined) updates.body = msgBody;
    if (type !== undefined) updates.type = type;
    if (tournamentId !== undefined) updates.tournamentId = tournamentId || null;
    if (isPinned !== undefined) updates.isPinned = isPinned;

    await adminDb.collection("announcements").doc(id).update(updates);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
