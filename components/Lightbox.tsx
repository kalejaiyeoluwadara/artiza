"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NEVER_CHANGES, onClient, onServer } from "../lib/useModalBehavior";

/** Same rise as the dialog: nothing was dragged, so nothing overshoots. */
const OPEN_SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };

/**
 * Full-screen photo viewer, opened from a thumbnail.
 *
 * It opens *over* the artisan sheet rather than replacing it, so it runs its
 * own key handling in the capture phase: the sheet is listening for Escape on
 * `document` too, and without stopping the event there one press would close
 * both surfaces at once.
 *
 * Paging is native scroll-snap rather than an animated index, for the same
 * reason the billboard is — the swipe and the arrows then drive one mechanism
 * and can never disagree about which photo is showing.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  alt,
}: {
  photos: string[];
  /** The photo to open on, or null when closed. */
  index: number | null;
  onClose: () => void;
  alt: (i: number) => string;
}) {
  // `position: fixed` is only relative to the viewport when no ancestor holds
  // a transform — the sheet this opens from is animating one. A portal to
  // <body> takes the viewer out of that tree entirely.
  const hydrated = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);
  if (!hydrated) return null;

  return createPortal(
    // The viewer mounts per opening, so which photo is showing is seeded from
    // the tapped thumbnail without ever having to be synced back to it.
    <AnimatePresence>
      {index !== null && (
        <Viewer
          key="lightbox"
          photos={photos}
          from={index}
          onClose={onClose}
          alt={alt}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Viewer({
  photos,
  from,
  onClose,
  alt,
}: {
  photos: string[];
  from: number;
  onClose: () => void;
  alt: (i: number) => string;
}) {
  const reduceMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Seeded from the thumbnail that was tapped, then owned by the rail's own
  // scroll position — the only thing that knows about a swipe.
  const [current, setCurrent] = useState(from);

  // Jumps the rail to the opening photo before the first paint, so the viewer
  // never flashes photo 1 on its way to the one that was actually tapped.
  const mountRail = useCallback(
    (node: HTMLDivElement | null) => {
      railRef.current = node;
      if (node) node.scrollLeft = from * node.clientWidth;
    },
    [from],
  );

  const go = useCallback(
    (to: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const clamped = Math.max(0, Math.min(photos.length - 1, to));
      rail.scrollTo({
        left: clamped * rail.clientWidth,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [photos.length, reduceMotion],
  );

  // Callers pass an inline arrow, so reading `onClose` through a ref keeps it
  // out of the key effect's deps and off the re-arm path.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Arrow keys step from where the rail actually is rather than from state, so
  // the handler never has to be re-armed as the photos page past.
  const step = useCallback(
    (delta: number) => {
      const rail = railRef.current;
      if (!rail) return;
      go(Math.round(rail.scrollLeft / rail.clientWidth) + delta);
    },
    [go],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    surfaceRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === "ArrowRight") {
        event.stopPropagation();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.stopPropagation();
        step(-1);
      } else if (event.key === "Tab") {
        // The sheet underneath traps Tab inside itself. While this is up, the
        // controls here are the only reachable ones, so its trap has to be
        // held off — the viewer's own buttons are the whole tab order.
        event.stopPropagation();
      }
    };

    // Capture, so the sheet's document-level handler never sees these keys.
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [step]);

  return (
    <motion.div
      ref={surfaceRef}
      role="dialog"
      aria-modal="true"
      aria-label="Past work photos"
      tabIndex={-1}
      className="fixed inset-0 z-130 bg-canvas outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.2 }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 0.96 }}
        animate={reduceMotion ? {} : { scale: 1 }}
        transition={OPEN_SPRING}
      >
        <div
          ref={mountRail}
          // Dismiss on tapping the art, the way a phone photo viewer does. It
          // rides on the rail itself rather than a covering overlay, which
          // would eat the swipe; a click only lands here when the pointer
          // didn't travel, so paging is never mistaken for a tap.
          onClick={onClose}
          onScroll={(event) => {
            const rail = event.currentTarget;
            setCurrent(Math.round(rail.scrollLeft / rail.clientWidth));
          }}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain"
        >
          {photos.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={alt(i)}
                fill
                sizes="100vw"
                // Contain, not cover: this screen exists to show the whole
                // photo, which the poster crop deliberately doesn't.
                className="object-contain"
                priority={i === from}
              />
            </div>
          ))}
        </div>
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        {photos.length > 1 ? (
          <span className="chrome figure rounded-full px-3 py-1.5 text-sm text-ink">
            {current + 1} of {photos.length}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="chrome pressable pointer-events-auto flex size-10 items-center justify-center rounded-full text-ink"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* A mouse can't flick, so desktop gets the arrows the swipe replaces on
          touch. They hide at each end rather than sitting there disabled. */}
      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 right-0 left-0 hidden items-center justify-between px-4 md:flex">
          <Arrow
            direction="previous"
            hidden={current === 0}
            onClick={() => go(current - 1)}
          />
          <Arrow
            direction="next"
            hidden={current === photos.length - 1}
            onClick={() => go(current + 1)}
          />
        </div>
      )}
    </motion.div>
  );
}

function Arrow({
  direction,
  hidden,
  onClick,
}: {
  direction: "previous" | "next";
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === "previous" ? "Previous" : "Next"} photo`}
      className={`chrome pressable flex size-11 items-center justify-center rounded-full text-ink transition-opacity duration-200 ${
        hidden ? "pointer-events-none opacity-0" : "pointer-events-auto"
      }`}
    >
      <Icon size={20} strokeWidth={2.2} />
    </button>
  );
}
