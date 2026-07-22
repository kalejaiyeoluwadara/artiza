import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth/options";

/**
 * NextAuth's own endpoints — sign-in, sign-out, session, CSRF. The only route
 * handler in the app: every other call goes straight to the Nest API through
 * `lib/api`.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
