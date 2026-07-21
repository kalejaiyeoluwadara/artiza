"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Tab order in BottomNav — swiping between tabs follows the bar. */
const TAB_ORDER = ["/", "/search", "/unlocked", "/account"];

function tabIndex(pathname: string) {
  const i = TAB_ORDER.findIndex((href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href),
  );
  return i;
}

/**
 * Which way the pages travel. Between tabs it follows the tab bar:
 * moving right along the bar pushes the old page off to the left.
 * Anything that isn't a tab is treated as a deeper screen — it pushes
 * in from the right and pops back out the way it came, the way a
 * native stack behaves.
 */
function direction(from: string, to: string) {
  const a = tabIndex(from);
  const b = tabIndex(to);
  if (a === -1 && b !== -1) return -1; // leaving a detail screen → pop
  if (b === -1) return 1; // entering a detail screen → push
  return b > a ? 1 : -1;
}

/**
 * Horizontal page swipe. The incoming page carries the full width;
 * the outgoing one trails at a third of the distance, so the two move
 * as related surfaces rather than one sheet of paper — the parallax is
 * what makes the direction legible.
 *
 * `popLayout` takes the exiting page out of flow so both pages travel
 * at once. Under `prefers-reduced-motion` the horizontal travel is
 * dropped entirely and only a short crossfade remains.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const nav = useRef({ prev: pathname, dir: 1 });
  if (nav.current.prev !== pathname) {
    nav.current = { prev: pathname, dir: direction(nav.current.prev, pathname) };
  }
  const dir = nav.current.dir;

  const variants = reduced
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (d: number) => ({ x: `${d * 100}%`, opacity: 1 }),
        // Numeric 0, not "0%": at rest framer then writes `transform: none`,
        // and a lingering translate would re-anchor `position: fixed`
        // children (sheets, modals) to this wrapper instead of the viewport.
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: `${d * -33}%`, opacity: 0.6 }),
      };

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div
          key={pathname}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            bounce: 0,
            duration: reduced ? 0.12 : 0.38,
          }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
