import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("__session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/login?next=/admin", request.url));
    }

    try {
      const { payload } = await jwtVerify(session, JWKS, {
        audience: PROJECT_ID,
        issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      });

      const email = ((payload.email as string | undefined) ?? "").toLowerCase();
      const admins = getAdminEmails();

      if (admins.length > 0 && !admins.includes(email)) {
        return NextResponse.redirect(new URL("/?error=forbidden", request.url));
      }

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/login?next=/admin", request.url)
      );
      response.cookies.delete("__session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
