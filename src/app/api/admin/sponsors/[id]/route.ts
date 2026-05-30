import { type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/server/verifyAdmin";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, logoUrl, websiteUrl, slotType, displayOrder, isActive } = body;

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (name !== undefined) updates.name = name;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl || null;
    if (slotType !== undefined) updates.slotType = slotType;
    if (displayOrder !== undefined) updates.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updates.isActive = isActive;

    await adminDb.collection("sponsors").doc(id).update(updates);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
