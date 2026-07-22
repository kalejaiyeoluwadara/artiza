import type { DefaultSession } from "next-auth";
import type { UserRole } from "../lib/api/types";

/**
 * The Artiza session carries the backend's tokens, because the Nest API — not
 * NextAuth — is the thing that actually authorises a request. NextAuth's job
 * here is to hold that pair in an encrypted cookie and rotate it.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      credits: number;
      phone?: string;
    } & DefaultSession["user"];
    /** Bearer token for the Nest API. */
    accessToken: string;
    /** Set when a refresh failed — the UI should send them to sign in again. */
    error?: "RefreshTokenError";
  }

  /** What `authorize()` returns, and what lands in the jwt callback on sign-in. */
  interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    credits: number;
    accessToken: string;
    refreshToken: string;
    /** Absolute expiry of the access token, in ms since epoch. */
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    credits: number;
    phone?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: "RefreshTokenError";
  }
}
