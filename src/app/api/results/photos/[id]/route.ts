import { type NextRequest } from "next/server";

/**
 * Serves one Results photo from Firestore.
 *
 * No sign-in check: an <img> can't send the ID token, and the photo ids
 * (random, 20 characters) are only handed out by the members-only feed.
 * A photo never changes once stored — an edit adds a new one — so browsers
 * keep it for good; the CDN keeps it a day, so a deleted photo stops being
 * served by then. Caching also keeps Firestore reads down.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return new Response(null, { status: 404 });

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb.collection("resultPhotos").doc(id).get();
    if (!snap.exists) return new Response(null, { status: 404 });

    const data = snap.get("data") as Buffer;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": snap.get("contentType"),
        "Cache-Control": "public, max-age=31536000, s-maxage=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
