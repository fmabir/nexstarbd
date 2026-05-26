import { type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
    const { tournamentId, tournamentName, playerName, uid, kills, damage, photoUrl, achievement, tournamentDate } = body;

    if (!playerName || !uid || kills === undefined) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    await adminDb.collection("mvpPlayers").add({
      tournamentId: tournamentId || "",
      tournamentName: tournamentName || "",
      playerName,
      uid,
      kills: Number(kills),
      damage: damage ? Number(damage) : null,
      photoUrl: photoUrl || null,
      achievement: achievement || "Most Kills",
      tournamentDate: tournamentDate ? Timestamp.fromDate(new Date(tournamentDate)) : FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
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
    await adminDb.collection("mvpPlayers").doc(id).delete();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
