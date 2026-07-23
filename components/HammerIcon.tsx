"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * A custom hammer icon that swings and strikes.
 *
 * The whole tool pivots around the grip (bottom of the handle) so the head
 * arcs down like a real swing: it rewinds up, drives down through the strike,
 * then settles. It doesn't loop on its own — that would nag. Instead it reacts
 * to the parent: any framer ancestor that flips into the `swing` variant on
 * hover / tap drives it, so the whole "Are you an artisan?" pill feels like the
 * trigger rather than the 13px glyph. Honours reduced-motion by staying still.
 *
 * Draw the head heavy and the handle thin so it still reads as a hammer at the
 * pill's tiny size.
 */
export function HammerIcon({ size = 13 }: { size?: number }) {
  const reduce = useReducedMotion();

  const swing: Variants = {
    rest: { rotate: 0 },
    swing: reduce
      ? { rotate: 0 }
      : {
          // rewind up, drive down through the strike, overshoot, settle
          rotate: [0, -20, 14, -4, 0],
          transition: {
            duration: 0.6,
            times: [0, 0.28, 0.55, 0.78, 1],
            ease: [0.34, 1.56, 0.64, 1],
          },
        },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      variants={swing}
      // Pivot from the grip so the head — not the whole glyph — does the swinging.
      style={{ transformOrigin: "9px 21px" }}
    >
      {/* Head — the heavy block, angled off the top of the handle. */}
      <rect
        x="2.5"
        y="3.25"
        width="12.5"
        height="5"
        rx="1.6"
        fill="currentColor"
      />
      {/* Neck — where the handle seats into the head. */}
      <path
        d="M8 8h3.2l-0.4 2.4H8.4z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Handle — thin shaft down to the grip. */}
      <rect
        x="8.1"
        y="8"
        width="2.4"
        height="13.2"
        rx="1.2"
        fill="currentColor"
      />
    </motion.svg>
  );
}
