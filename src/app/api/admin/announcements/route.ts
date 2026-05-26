import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

async function verifyAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) throw new Error("Unauthorized");
  const { payload } = await jwtVerify(session, JWKS, {
    audience: PROJECT_ID,
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  });
  return (payload.email as string) || "admin";
}

export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdmin();
    const body = await request.json();
    const { title, body: msgBody, type, tournamentId, isPinned } = body;

    if (!msgBody || !type) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb.collection("announcements").add({
      tournamentId: tournamentId || null,
      title: title || null,
      body: msgBody,
      type,
      isPinned: isPinned || false,
      postedByEmail: email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg === "Unauthorized") return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin();
    const { id } = await request.json();
    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb.collection("announcements").doc(id).delete();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
