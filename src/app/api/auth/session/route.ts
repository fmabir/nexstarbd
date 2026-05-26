import { type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return Response.json({ error: "No token" }, { status: 400 });
  }

  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    await adminAuth.verifyIdToken(token);

    const cookieStore = await cookies();
    cookieStore.set("__session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  return Response.json({ ok: true });
}
