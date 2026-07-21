"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Tab-bar page transition.
 *
 * The previous approach used `mode="wait"` which serialises exit → enter,
 * creating a dead gap between pages. Tab switching needs to feel instant,
 * so this version cross-fades both pages simultaneously:
 *
 * - The old page fades out (opacity only, no movement — movement on exit
 *   causes a layout repaint that stutters).
 * - The new page fades in with a very subtle upward drift (6px, spring,
 *   critically damped). Both run concurrently so total transition time
 *   is ~200ms, not 2× that.
 * - Only `opacity` and `transform` are animated — both are compositor-
 *   friendly and won't trigger layout/paint.
 *
 * `popLayout` removes the exiting element from flow immediately so the
 * entering element takes its natural position without waiting.
 *
 * Reduced-motion: drops the vertical shift entirely, keeps a 120ms
 * opacity crossfade for spatial continuity.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: reduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: reduced ? 0.12 : 0.18,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          willChange: "opacity, transform",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
