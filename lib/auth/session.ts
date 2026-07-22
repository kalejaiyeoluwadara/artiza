import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { createApi, type Api } from "../api";
import { authOptions } from "./options";

/** The session on the server. `null` when signed out. */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/**
 * For pages that make no sense signed out. Redirects rather than throwing, and
 * carries the attempted path so sign-in can send them back.
 */
export async function requireSession(returnTo?: string): Promise<Session> {
  const session = await getSession();

  if (!session || session.error) {
    const target = returnTo ? `?callbackUrl=${encodeURIComponent(returnTo)}` : "";
    redirect(`/sign-in${target}`);
  }

  return session;
}

/**
 * The API bound to the caller's token, for Server Components and Server
 * Actions. Signed out, it still works — it just cannot reach the routes that
 * need a bearer token.
 */
export async function serverApi(): Promise<Api> {
  const session = await getSession();
  return createApi(session?.accessToken);
}

/** The API for a route that has already established there is a session. */
export async function authedServerApi(returnTo?: string): Promise<Api> {
  const session = await requireSession(returnTo);
  return createApi(session.accessToken);
}
