import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Next 16 renamed Middleware to Proxy. Same file-convention slot, same job:
 * run before the request completes.
 *
 * This is an *optimistic* check only — it reads the session cookie to keep
 * signed-out visitors from landing on a page that will immediately bounce
 * them. The real authorisation happens at the Nest API, which verifies the
 * bearer token on every call and does not trust this.
 */
const PROTECTED_PREFIXES = ["/account", "/unlocked"];

/** Needs a session *and* `role: "admin"`. */
const ADMIN_PREFIX = "/admin";

function covers(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const needsAdmin = covers(pathname, ADMIN_PREFIX);
  const needsSession =
    needsAdmin || PROTECTED_PREFIXES.some((prefix) => covers(pathname, prefix));

  if (!needsSession) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // A token whose refresh has already failed is as good as none.
  if (token && !token.error) {
    // A signed-in customer who wanders into /admin is sent to the app rather
    // than to sign-in: they have a valid session, it just isn't this one's.
    // Signing out and back in as themselves would change nothing.
    if (needsAdmin && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/unlocked/:path*", "/admin/:path*"],
};
