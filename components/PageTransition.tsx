"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Wraps `{children}` in a keyed motion container that cross-fades
 * between routes. The key is the pathname, so every navigation mounts
 * a fresh animated wrapper.
 *
 * The effect is a subtle fade + upward drift — fast enough that
 * tab-switching (the most frequent action) never feels sluggish,
 * but visible enough that the page doesn't pop in raw.
 *
 * Respects `prefers-reduced-motion`: if the OS says reduce, the
 * vertical shift is dropped and only a quick opacity crossfade remains.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const y = reduced ? 0 : 6;
  const exitY = reduced ? 0 : -4;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: exitY }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: reduced ? 0.12 : 0.25,
        }}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
