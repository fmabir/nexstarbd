/**
 * The server's view of who is signed in.
 *
 * The __session cookie holds a Firebase session cookie (made from the ID
 * token at sign-in by /api/auth/session), not the ID token itself: an ID
 * token expires after an hour, a session cookie lasts up to two weeks.
 * Every server check — proxy.ts, verifyAdmin, getSessionUser — reads it
 * through verifySession so they can never disagree.
 */
export const SESSION_COOKIE = "__session";

/** Firebase's maximum lifetime for a session cookie: two weeks. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether this email is in ADMIN_EMAILS. Fails CLOSED: an unset or empty
 * ADMIN_EMAILS means nobody is an admin, never everybody.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  const allowed = adminEmails();
  return allowed.length > 0 && !!email && allowed.includes(email.toLowerCase());
}

/** The user a session cookie belongs to, or null when it's missing, expired or forged. */
export async function verifySession(cookieValue: string | undefined) {
  if (!cookieValue) return null;
  try {
    const { adminAuth } = await import("@/lib/firebase/admin");
    return await adminAuth.verifySessionCookie(cookieValue);
  } catch {
    return null;
  }
}
