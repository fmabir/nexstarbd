import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

/** The signed-in user, from the session cookie; null when signed out or expired. */
export async function getSessionUser() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}
