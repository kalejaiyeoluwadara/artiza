"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFavorites } from "../lib/useFavorites";

/**
 * The heart on an artisan card.
 *
 * Two hearts stacked rather than one that changes colour: the outline is
 * always there so the control never disappears against a photo, and the filled
 * one springs in over it. Filling is the whole event, so it is the only thing
 * that animates — and it animates from nothing to full, which reads as
 * *taking* the artisan rather than merely recolouring a glyph.
 */
export function FavoriteButton({
  artisanId,
  name,
  className = "",
}: {
  artisanId: string;
  name: string;
  className?: string;
}) {
  const { isFavorite, toggle } = useFavorites();
  const reduced = useReducedMotion();
  const active = isFavorite(artisanId);

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        // The card behind this is one big tap target that opens the sheet.
        event.stopPropagation();
        toggle(artisanId);
      }}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${name} from favourites` : `Save ${name} to favourites`
      }
      // Feedback on pointer-down, not on release — the press has to feel
      // immediate even though the state change lands on the tap.
      whileTap={reduced ? undefined : { scale: 0.86 }}
      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
      className={`chrome grid size-9 place-items-center rounded-full text-ink ${className}`}
    >
      <span className="relative grid size-4.5 place-items-center">
        <HeartOutline />

        <AnimatePresence initial={false}>
          {active ? (
            <motion.span
              key="fill"
              className="absolute inset-0 grid place-items-center text-accent"
              initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              // A tap carries no momentum into this, so it settles rather than
              // bounces — the house rule, and a bouncing heart on every card
              // would spend the motion budget on the smallest thing here.
              transition={{ type: "spring", bounce: 0, duration: 0.28 }}
            >
              <HeartFilled />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

function HeartOutline() {
  return (
    <svg
      viewBox="0 0 18 18"
      className="size-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 15.4S2.4 11.5 2.4 6.9A3.6 3.6 0 0 1 9 4.9a3.6 3.6 0 0 1 6.6 2c0 4.6-6.6 8.5-6.6 8.5Z" />
    </svg>
  );
}

function HeartFilled() {
  return (
    <svg
      viewBox="0 0 18 18"
      className="size-4.5"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 15.4S2.4 11.5 2.4 6.9A3.6 3.6 0 0 1 9 4.9a3.6 3.6 0 0 1 6.6 2c0 4.6-6.6 8.5-6.6 8.5Z" />
    </svg>
  );
}
