import { type NextRequest } from "next/server";
import { serialize } from "@/lib/utils/serialize";
import type { ResultPost } from "@/lib/types";

/**
 * The published Results feed — signed-in members only.
 *
 * The caller sends its Firebase ID token as a Bearer header rather than
 * relying on the __session cookie: the browser keeps that token fresh, while
 * the cookie holds whatever token was current at sign-in.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    await adminAuth.verifyIdToken(token);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    // Equality filter only, sorted here: needs no composite index
    const snap = await adminDb.collection("resultPosts").where("status", "==", "published").get();
    const posts = snap.docs
      .map((d) => {
        const post = d.data();
        delete post.postedByEmail; // which admin wrote it stays private
        return { id: d.id, ...post } as unknown as ResultPost;
      })
      .sort((a, b) => (b.publishedAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? 0));

    return Response.json(
      { posts: serialize(posts) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
