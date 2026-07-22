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

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const needsSession = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!needsSession) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // A token whose refresh has already failed is as good as none.
  if (token && !token.error) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/unlocked/:path*"],
};
