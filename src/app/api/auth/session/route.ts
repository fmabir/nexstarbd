import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";

/** Whether the browser's session cookie is still good. The client re-creates it when it isn't. */
export async function GET() {
  return Response.json({ valid: (await getSessionUser()) !== null });
}

/** Swaps a fresh ID token for a two-week session cookie and records the user's profile. */
export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return Response.json({ error: "No token" }, { status: 400 });
  }

  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase/admin");
    const decoded = await adminAuth.verifyIdToken(token);
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn: SESSION_MAX_AGE_MS });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    // Upsert user profile document
    const userRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();
    const now = FieldValue.serverTimestamp();

    if (!userDoc.exists) {
      await userRef.set({
        uid: decoded.uid,
        displayName: decoded.name ?? null,
        email: decoded.email ?? null,
        photoURL: decoded.picture ?? null,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await userRef.update({
        displayName: decoded.name ?? null,
        email: decoded.email ?? null,
        photoURL: decoded.picture ?? null,
        updatedAt: now,
      });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
