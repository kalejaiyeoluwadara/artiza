/**
 * The one place `NEXTAUTH_SECRET` is read.
 *
 * It has to be shared, because two separate pieces of code use it and they
 * must agree: NextAuth encrypts the session cookie with it, and `proxy.ts`
 * decrypts that cookie with it on every protected route.
 *
 * Left unset, NextAuth quietly derives a fallback in development and signs the
 * user in successfully — while `getToken()` in the proxy, handed `undefined`,
 * fails to read the very cookie that was just written and redirects back to
 * the sign-in form. Sign-in works, the guard undoes it, and nothing anywhere
 * reports an error. Failing loudly here costs one clear message instead of an
 * afternoon.
 */
function readSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Add it to .env.local and restart the dev " +
        "server:\n\n  NEXTAUTH_SECRET=$(openssl rand -base64 32)\n\n" +
        "Without it, sign-in appears to succeed but every protected route " +
        "redirects back to the sign-in form.",
    );
  }

  return secret;
}

export const authSecret = readSecret();
