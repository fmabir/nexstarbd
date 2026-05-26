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
  await jwtVerify(session, JWKS, { audience: PROJECT_ID, issuer: `https://securetoken.google.com/${PROJECT_ID}` });
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin();
    const body = await request.json();
    const { name, logoUrl, websiteUrl, slotType, displayOrder, isActive } = body;

    if (!name || !logoUrl) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await adminDb.collection("sponsors").doc(slug).set({
      name,
      logoUrl,
      websiteUrl: websiteUrl || null,
      slotType: slotType || "banner",
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== false,
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
    await adminDb.collection("sponsors").doc(id).delete();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
