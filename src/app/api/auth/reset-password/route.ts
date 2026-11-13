import { type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { consumeOtp, normalizeEmail } from "@/lib/server/otp";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = normalizeEmail(body.email);
  const { otp, newPassword } = body;

  if (!email || !otp || typeof newPassword !== "string" || !newPassword) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return Response.json({ error: "weak-password" }, { status: 400 });
  }

  try {
    // Reset codes only; wrong guesses are counted and the code is used up on success
    const result = await consumeOtp(email, otp, "password_reset");
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

    await adminAuth.updateUser(result.uid, { password: newPassword });

    // Sign user in with custom token
    const customToken = await adminAuth.createCustomToken(result.uid);
    return Response.json({ ok: true, customToken });
  } catch (err) {
    console.error("reset-password error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
