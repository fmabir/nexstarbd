import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/*
 * Email codes for sign-up and password reset.
 *
 * A 6-digit code has a million values, so on its own it only holds up if
 * guesses are scarce: each code allows MAX_ATTEMPTS wrong tries and then
 * stops working, and each address (and each IP) can only be sent so many
 * codes an hour. Codes live in pendingVerifications/{email}; the send
 * limits live apart in otpRateLimits, so dropping a used or locked code
 * doesn't reset them. Neither collection is open to the browser.
 */
export const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const HOUR = 60 * 60 * 1000;
/** Matches the login screen's 60-second resend countdown, less some slack for latency */
const MIN_GAP_MS = 55 * 1000;
const MAX_SENDS_PER_EMAIL = 5;
const MAX_SENDS_PER_IP = 20;

export type OtpType = "signup" | "password_reset";

/** Firebase treats emails case-insensitively; key the codes the same way. */
export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return e.includes("@") ? e : null;
}

export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 32);

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
}

async function allow(key: string, max: number, minGapMs: number): Promise<boolean> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = adminDb.collection("otpRateLimits").doc(key);
  return adminDb.runTransaction(async (tx) => {
    const now = Date.now();
    const d = (await tx.get(ref)).data();
    const inWindow = d && now - d.windowStart < HOUR;
    if (inWindow && (d.count >= max || now - d.lastAt < minGapMs)) return false;
    tx.set(ref, {
      windowStart: inWindow ? d.windowStart : now,
      count: inWindow ? d.count + 1 : 1,
      lastAt: now,
    });
    return true;
  });
}

/**
 * Whether another code may be emailed to this address from this client.
 * Counts the send when it's allowed. Answered with "too-many-requests",
 * which the login screen already explains.
 */
export async function mayRequestOtp(request: NextRequest, email: string): Promise<boolean> {
  if (!(await allow(`email:${hash(email)}`, MAX_SENDS_PER_EMAIL, MIN_GAP_MS))) return false;
  const ip = clientIp(request);
  return ip ? allow(`ip:${hash(ip)}`, MAX_SENDS_PER_IP, 0) : true;
}

/** Stores a fresh code for the address, replacing any earlier one. */
export async function saveOtp(email: string, uid: string, otp: string, type: OtpType) {
  const { adminDb } = await import("@/lib/firebase/admin");
  await adminDb.collection("pendingVerifications").doc(email).set({
    uid,
    otp,
    email,
    type,
    attempts: 0,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

/**
 * Checks a code and uses it up. A code only works for the flow it was sent
 * for, once. Wrong guesses count; after MAX_ATTEMPTS the code is dropped and
 * reported as expired, so the player asks for a new one.
 */
export async function consumeOtp(
  email: string,
  otp: unknown,
  type: OtpType
): Promise<{ ok: true; uid: string } | { ok: false; error: "invalid-otp" | "otp-expired" }> {
  const { adminDb } = await import("@/lib/firebase/admin");
  const ref = adminDb.collection("pendingVerifications").doc(email);
  const given = Buffer.from(String(otp ?? ""));

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false, error: "invalid-otp" } as const;
    const d = snap.data()!;

    // Codes saved before `type` existed were all sign-up codes
    if ((d.type ?? "signup") !== type) return { ok: false, error: "invalid-otp" } as const;

    if (Date.now() > d.expiresAt) {
      tx.delete(ref);
      return { ok: false, error: "otp-expired" } as const;
    }

    const expected = Buffer.from(String(d.otp));
    const match = expected.length === given.length && timingSafeEqual(expected, given);
    if (!match) {
      const attempts = (d.attempts ?? 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        tx.delete(ref);
        return { ok: false, error: "otp-expired" } as const;
      }
      tx.update(ref, { attempts });
      return { ok: false, error: "invalid-otp" } as const;
    }

    tx.delete(ref);
    return { ok: true, uid: d.uid as string } as const;
  });
}
