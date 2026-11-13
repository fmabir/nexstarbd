import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isAdminEmail, verifySession } from "@/lib/server/auth";

// Proxy runs on the Node.js runtime, so it checks the session cookie with
// the Firebase Admin SDK — the same check as verifyAdmin.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const user = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

    if (!user) {
      const response = NextResponse.redirect(new URL("/login?next=/admin", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Fail CLOSED — see isAdminEmail. No configured admins => no access.
    if (!isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/?error=forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
