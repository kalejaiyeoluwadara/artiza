"use client";

import { useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

/**
 * A refresh that fails is terminal — the backend rotates refresh tokens, so
 * the one in the cookie is already spent and nothing in the session will work
 * again. Rather than let the customer tap through a screen of 401s, the dead
 * session is cleared the moment it is noticed.
 */
function ExpiredSessionWatcher({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      void signOut({ callbackUrl: "/sign-in?expired=1" });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    // No polling: Artiza is a browse-and-unlock app, not a dashboard, and a
    // background request every few minutes costs a customer on mobile data
    // more than a slightly stale credit count costs us. The session is
    // refetched when the tab regains focus, which covers the real case.
    <SessionProvider refetchInterval={0} refetchOnWindowFocus>
      <ExpiredSessionWatcher>{children}</ExpiredSessionWatcher>
    </SessionProvider>
  );
}
