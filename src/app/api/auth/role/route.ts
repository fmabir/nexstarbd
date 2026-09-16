import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/server/verifyAdmin";

/**
 * Tells the client which side of the app the signed-in user belongs to.
 *
 * ADMIN_EMAILS is server-only (and must stay that way), so the browser cannot
 * work this out for itself. This reuses verifyAdmin() rather than re-reading
 * the env list, so the login redirect can never disagree with the actual gate
 * in proxy.ts.
 */
export async function GET() {
  try {
    await verifyAdmin();
    return NextResponse.json({ isAdmin: true });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
