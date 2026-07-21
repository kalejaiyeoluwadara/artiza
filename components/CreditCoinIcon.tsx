"use client";

import { motion } from "framer-motion";

/**
 * A custom credit-coin icon with a subtle animated shimmer.
 * Two concentric circles with an embossed "A" (for Artiza) monogram
 * and a periodic shine sweep across the surface.
 *
 * Designed to sit inside the 28×28 pill next to the credits / "Buy Bundle"
 * label on the Unlocked screen.
 */
export function CreditCoinIcon({ size = 14 }: { size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Outer coin ring */}
        <circle
          cx="12"
          cy="12"
          r="11"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Inner ring — gives the coin a minted, beveled look */}
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.35"
          fill="none"
        />
        {/* "A" monogram — Artiza */}
        <path
          d="M12 7L8.5 17H10.3L11 14.8H13L13.7 17H15.5L12 7ZM11.4 13.2L12 10.6L12.6 13.2H11.4Z"
          fill="currentColor"
        />
      </svg>

      {/* Shimmer — a diagonal glint that sweeps across periodically */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <motion.span
          className="absolute inset-y-0 w-[60%] bg-gradient-to-r from-transparent via-white/60 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: ["-120%", "220%"] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 5,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </motion.span>
    </span>
  );
}
