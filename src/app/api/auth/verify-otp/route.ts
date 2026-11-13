import { type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { consumeOtp, normalizeEmail } from "@/lib/server/otp";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = normalizeEmail(body.email);
  const { otp } = body;

  if (!email || !otp) return Response.json({ error: "Email and OTP are required" }, { status: 400 });

  try {
    // Sign-up codes only; wrong guesses are counted and the code is used up on success
    const result = await consumeOtp(email, otp, "signup");
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

    // Enable and mark verified
    await adminAuth.updateUser(result.uid, { disabled: false, emailVerified: true });

    // Generate custom token so client can sign in
    const customToken = await adminAuth.createCustomToken(result.uid);

    return Response.json({ ok: true, customToken });
  } catch (err) {
    console.error("verify-otp error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
