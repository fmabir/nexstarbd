import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) throw new Error("Unauthorized");
  await jwtVerify(session, JWKS, {
    audience: PROJECT_ID,
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  });
}

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
      "roomId",
      "roomPassword",
      "name",
      "description",
      "prizePool",
      "bannerUrl",
    ];

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    await adminDb.collection("tournaments").doc(id).update(update);
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg === "Unauthorized") return Response.json({ error: "Unauthorized" }, { status: 401 });
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
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
