import { isAdminEmail } from "./auth";
import { getSessionUser } from "./session";

/**
 * Throws "Unauthorized" when nobody is signed in and "Forbidden" when the
 * signed-in user isn't in ADMIN_EMAILS; returns the admin's email otherwise.
 */
export async function verifyAdmin(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!isAdminEmail(user.email)) throw new Error("Forbidden");
  return user.email!.toLowerCase();
}
