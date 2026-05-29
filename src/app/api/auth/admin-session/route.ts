import { type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = (decoded.email ?? "").toLowerCase();
    const admins = getAdminEmails();

    if (admins.length > 0 && !admins.includes(email)) {
      return Response.json({ error: "not-admin" }, { status: 403 });
    }

    const cookieStore = await cookies();
    cookieStore.set("__session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
