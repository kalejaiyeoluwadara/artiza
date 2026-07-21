"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

/**
 * Apple's momentum projection (Designing Fluid Interfaces). Predicts
 * where a flick would come to rest, so a fast short swipe dismisses
 * and a slow long drag doesn't. The physics-textbook v²/2a is not what
 * iOS ships — this exponential-decay form is.
 */
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Drawer feel from the apple-design table: damping 0.8, response 0.3. */
const DRAWER_SPRING = { type: "spring" as const, bounce: 0.2, duration: 0.35 };

export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  children: React.ReactNode;
}) {
  const y = useMotionValue(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const reduceMotion = useReducedMotion();

  // Measured on mount so the exit animates to an exact pixel target
  // rather than a percentage framer would have to reinterpret mid-flight.
  // It has to be known before the first drag, or the scrim and the
  // dismiss threshold would both be computed against zero.
  const [height, setHeight] = useState(0);
  // Release velocity is handed to the exit spring, so there is no seam
  // between the finger letting go and the sheet flying out.
  const exitVelocity = useRef(0);

  const scrim = useTransform(y, [0, Math.max(height, 1)], [1, 0]);

  useEffect(() => {
    if (!open) return;

    y.set(0);
    exitVelocity.current = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, y]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100">
          {/* Dimming scrim: this is a modal task, so the background gets
              pushed back rather than staying live. */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 w-full cursor-default bg-black/35"
            style={{ opacity: reduceMotion ? undefined : scrim }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            ref={(node) => {
              sheetRef.current = node;
              if (node && node.offsetHeight !== height) {
                setHeight(node.offsetHeight);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-canvas shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
            style={{ y }}
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: height || 800 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { ...DRAWER_SPRING, velocity: exitVelocity.current }
            }
            drag={reduceMotion ? false : "y"}
            dragControls={controls}
            // Drag only starts from the grabber, so content scrolls freely
            // and the two gestures never have to be disambiguated.
            dragListener={false}
            dragConstraints={{ top: 0 }}
            // Resist upward instead of stopping dead at the boundary.
            dragElastic={0.04}
            dragSnapToOrigin
            dragTransition={{
              bounceStiffness: 400,
              bounceDamping: 40,
            }}
            onDragEnd={(_, info) => {
              const projected = info.offset.y + project(info.velocity.y);
              const threshold = (height || 800) * 0.4;
              if (projected > threshold) {
                exitVelocity.current = info.velocity.y;
                onClose();
              }
            }}
          >
            {/* Grab area. touch-none keeps the browser from claiming the
                gesture for scroll before we see it. */}
            <div
              onPointerDown={(e) => controls.start(e)}
              className="shrink-0 cursor-grab touch-none pt-2.5 pb-1 active:cursor-grabbing"
            >
              <div
                aria-hidden
                className="mx-auto h-1 w-9 rounded-full bg-faint"
              />
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
