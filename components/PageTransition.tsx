"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * Tab-bar page transition, built on React's native <ViewTransition>.
 *
 * The previous framer-motion version (AnimatePresence keyed by pathname)
 * doesn't work in the App Router: the exiting subtree re-renders with the
 * *new* page's children (the layout owns a single `children` slot), and the
 * per-route `loading.tsx` boundaries commit the pathname change while only
 * the skeleton is on screen — so the fade ran against the wrong content or
 * not at all.
 *
 * <ViewTransition> snapshots the real pixels of the outgoing page before
 * the commit, so neither problem exists. Re-keying by pathname unmounts the
 * old page (exit) and mounts the new one (enter); both animations run
 * concurrently as a cross-fade with a 6px rise on the incoming page. The
 * animation CSS lives in globals.css under `.page-enter` / `.page-exit`.
 *
 * `default="none"` keeps Suspense reveals inside the page (loading.tsx →
 * content) from re-triggering the transition — skeletons carry their own
 * entrance animation.
 *
 * Reduced-motion handling (drop the rise, keep a 120ms fade) is done in
 * the same CSS via `prefers-reduced-motion`.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      key={pathname}
      enter="page-enter"
      exit="page-exit"
      default="none"
    >
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
