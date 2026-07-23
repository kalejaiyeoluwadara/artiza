import type { AuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { publicApi } from "../api";
import { authSecret } from "./secret";
import { ApiError } from "../api/error";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Google sign-in is opt-in: with no credentials configured the provider is
 * simply absent, so the button hides itself and password sign-in is unaffected.
 * Registering it with empty strings would instead fail at the redirect, which
 * is a worse way to find out.
 */
const googleEnabled = Boolean(googleClientId && googleClientSecret);

/**
 * Refresh this far before the access token actually expires. The window
 * absorbs clock skew and a slow round trip, so a request never leaves with a
 * token that expires in flight.
 */
const REFRESH_SKEW_MS = 60_000;

/** Mirrors the backend's JWT_REFRESH_TTL — the cookie should not outlive it. */
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Exchanges the refresh token for a new pair.
 *
 * The backend *rotates* on refresh: the presented token is invalidated as the
 * new one is issued. That makes a stolen token usable at most once — and it
 * means a failure here is terminal, so the session is flagged rather than
 * retried with a token the server has already forgotten.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const result = await publicApi.auth.refresh(token.refreshToken);

    return {
      ...token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      accessTokenExpires: Date.now() + result.expiresIn * 1000,
      credits: result.user.credits,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Artiza",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      /**
       * The Nest API is the only thing that checks a password. This provider
       * just carries the answer — on success the backend's token pair comes
       * back with the user and gets sealed into the session cookie.
       */
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const result = await publicApi.auth.login({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone,
            role: result.user.role,
            credits: result.user.credits,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            accessTokenExpires: Date.now() + result.expiresIn * 1000,
          };
        } catch (error) {
          // NextAuth turns a thrown error into a generic failure anyway, so
          // the backend's wording is passed through for the sign-in form —
          // and anything unexpected is surfaced as a plain failure.
          if (error instanceof ApiError) throw new Error(error.message);
          return null;
        }
      },
    }),

    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            // `prompt: select_account` so a shared device does not silently
            // sign in whichever Google account happens to be active.
            authorization: {
              params: { prompt: "select_account", scope: "openid email profile" },
            },
          }),
        ]
      : []),
  ],

  // Credentials sign-in requires JWT sessions: there is no adapter, so the
  // session has nowhere else to live.
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    /**
     * Google lands here first. NextAuth has verified the OAuth exchange with
     * Google, but the Nest API is what actually owns accounts — so the ID
     * token is handed to it, and what comes back is a real Artiza token pair.
     *
     * Doing it here rather than in `jwt` is deliberate: returning false aborts
     * the sign-in, so a failed exchange leaves no session at all. The `jwt`
     * callback has no way to refuse, and would leave a cookie with a user in
     * it and no backend token behind it.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      if (!account.id_token) return false;

      try {
        const result = await publicApi.auth.google(account.id_token);

        // Mutating `user` is how this reaches the `jwt` callback — it receives
        // this same object on the sign-in pass.
        Object.assign(user, {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          credits: result.user.credits,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpires: Date.now() + result.expiresIn * 1000,
        } satisfies User);

        return true;
      } catch {
        // Sends them back to /sign-in rather than into a session that cannot
        // call the API.
        return false;
      }
    },

    /**
     * Runs on sign-in and on every session read. Three branches: seed the
     * token, hand back a still-valid one, or refresh.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          credits: user.credits,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // `update()` from the client, after a purchase changes the balance.
      if (trigger === "update") {
        // An explicit balance (a credit-funded unlock knows the new figure) is
        // applied directly. A bare `update()` — the return from a bundle or a
        // paid unlock, where the webhook changed the balance server-side — has
        // no figure to trust, so it pulls the live one from the backend.
        if (typeof session?.credits === "number") {
          return { ...token, credits: session.credits };
        }
        return refreshAccessToken(token);
      }

      if (Date.now() < token.accessTokenExpires - REFRESH_SKEW_MS) {
        return token;
      }

      return refreshAccessToken(token);
    },

    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        credits: token.credits,
        phone: token.phone,
      };
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },

  // The cookie is the credential — it must never be readable from JavaScript.
  useSecureCookies: process.env.NODE_ENV === "production",
  // Shared with proxy.ts — see lib/auth/secret.ts for why that matters.
  secret: authSecret,
  debug: false,
};
