import { type NextRequest } from "next/server";
import { serialize } from "@/lib/utils/serialize";
import { withPrivateFields } from "@/lib/server/privateData";
import type { Registration } from "@/lib/types";

/**
 * The signed-in player's own registrations, newest first, with their own
 * contact and payment details. Authenticated by a Bearer ID token (the
 * browser keeps it fresh), like /api/results.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let uid: string;
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    uid = (await adminAuth.verifyIdToken(token)).uid;
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    // Equality filter only, sorted here: needs no composite index
    const snap = await adminDb.collection("registrations").where("userId", "==", uid).get();
    const registrations = await withPrivateFields(
      adminDb,
      snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Registration)
    );
    registrations.sort((a, b) => (b.registeredAt?.seconds ?? 0) - (a.registeredAt?.seconds ?? 0));

    return Response.json(
      { registrations: serialize(registrations) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
