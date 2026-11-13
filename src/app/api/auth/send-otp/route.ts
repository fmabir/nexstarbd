import { type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { sendOtpEmail } from "@/lib/email/resend";
import { generateOtp, mayRequestOtp, normalizeEmail, saveOtp } from "@/lib/server/otp";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, displayName, resendOnly, type } = body;
  const email = normalizeEmail(body.email);

  if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

  const isPasswordReset = type === "password_reset";
  if (!isPasswordReset && !resendOnly && typeof password === "string" && password.length < 6) {
    return Response.json({ error: "weak-password" }, { status: 400 });
  }

  try {
    // Before touching any account: caps how many codes an address (and an IP) can be sent
    if (!(await mayRequestOtp(request, email))) {
      return Response.json({ error: "too-many-requests" }, { status: 429 });
    }

    const otp = generateOtp();

    let uid: string;
    let name: string = displayName || "";

    if (isPasswordReset) {
      // Account must exist and be verified
      let existing;
      try {
        existing = await adminAuth.getUserByEmail(email);
      } catch {
        return Response.json({ error: "no-account" }, { status: 404 });
      }
      if (existing.disabled) {
        return Response.json({ error: "no-account" }, { status: 404 });
      }
      uid = existing.uid;
      name = existing.displayName || "";
    } else if (resendOnly) {
      let existing;
      try {
        existing = await adminAuth.getUserByEmail(email);
      } catch {
        return Response.json({ error: "Account not found" }, { status: 404 });
      }
      if (!existing.disabled) {
        return Response.json({ error: "Email already verified" }, { status: 409 });
      }
      uid = existing.uid;
      name = existing.displayName || "";
    } else {
      if (!password) return Response.json({ error: "Password is required" }, { status: 400 });

      let existing = null;
      try {
        existing = await adminAuth.getUserByEmail(email);
      } catch {
        // Will create below
      }

      if (existing) {
        if (!existing.disabled) {
          return Response.json({ error: "email-already-in-use" }, { status: 409 });
        }
        await adminAuth.updateUser(existing.uid, { password });
        uid = existing.uid;
        name = existing.displayName || displayName || "";
      } else {
        const created = await adminAuth.createUser({
          email,
          password,
          displayName: displayName?.trim() || undefined,
          disabled: true,
          emailVerified: false,
        });
        uid = created.uid;
        name = displayName || "";
      }
    }

    await saveOtp(email, uid, otp, isPasswordReset ? "password_reset" : "signup");

    await sendOtpEmail(email, otp, name, isPasswordReset ? "password_reset" : "signup");

    return Response.json({ ok: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
