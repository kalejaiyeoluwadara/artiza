"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { createApi, type Api } from ".";

export interface UseApiResult {
  api: Api;
  /** True while the session is still loading — hold off on authed calls. */
  loading: boolean;
  signedIn: boolean;
  userId?: string;
  credits: number;
}

/**
 * The API bound to the signed-in customer, for Client Components.
 *
 * Rebuilt only when the token actually changes, so passing `api` to a `useEffect`
 * dependency array doesn't re-fire it on every render.
 */
export function useApi(): UseApiResult {
  const { data: session, status } = useSession();
  const token = session?.accessToken;

  const api = useMemo(() => createApi(token), [token]);

  return {
    api,
    loading: status === "loading",
    signedIn: status === "authenticated" && !session?.error,
    userId: session?.user?.id,
    credits: session?.user?.credits ?? 0,
  };
}
