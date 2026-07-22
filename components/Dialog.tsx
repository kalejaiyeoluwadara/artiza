"use client";

import { useId, useRef, useSyncExternalStore, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  NEVER_CHANGES,
  onClient,
  onServer,
  useModalBehavior,
} from "../lib/useModalBehavior";

/**
 * Critically damped, response 0.4 — the apple-design default for a surface
 * that appears on its own. No gesture preceded it, so it must not overshoot.
 */
const DIALOG_SPRING = { type: "spring" as const, bounce: 0, duration: 0.4 };

/**
 * The app's centred modal, distinct from the bottom `Sheet`.
 *
 * The sheet is for browsing a profile — draggable, dismissible, part of the
 * flow. This is for a decision: it dims the page, takes focus, and expects an
 * answer. Anything the customer can simply walk away from belongs in a sheet.
 */
export function Dialog({
  open,
  onClose,
  label,
  description,
  children,
  /** Where focus lands on open — the safe choice, for a destructive confirm. */
  initialFocusRef,
  /** Off while a request is in flight, so a click can't abandon it midway. */
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  description?: string;
  children: React.ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  dismissable?: boolean;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);
  const titleId = useId();
  const descriptionId = useId();

  // `position: fixed` is only relative to the viewport when no ancestor holds
  // a transform or filter — the page transition wrapper does. A portal to
  // <body> takes this out of that tree entirely.
  useModalBehavior({
    open,
    onClose: dismissable ? onClose : () => {},
    surfaceRef,
    autoFocusRef: initialFocusRef,
  });

  if (!hydrated) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
          {/* A decision is a modal task, so the background is pushed back
              rather than left live behind a transparent layer. */}
          <motion.button
            type="button"
            aria-label={dismissable ? `Close ${label}` : undefined}
            aria-hidden={!dismissable}
            tabIndex={-1}
            disabled={!dismissable}
            onClick={dismissable ? onClose : undefined}
            className="absolute inset-0 w-full cursor-default bg-black/35 disabled:cursor-not-allowed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
          />

          <motion.div
            ref={surfaceRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className="relative w-full max-w-[26rem] overflow-hidden rounded-3xl bg-card p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] outline-none"
            {...(reduceMotion
              ? {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.15 },
                }
              : {
                  // Scales up from just under full size rather than sliding —
                  // it belongs to the page it is covering, not to an edge.
                  initial: { opacity: 0, scale: 0.94, y: 12 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.96, y: 8 },
                  transition: DIALOG_SPRING,
                })}
          >
            {/* Named for assistive tech; the visible heading is in `children`
                and carries the same id. */}
            <span id={titleId} className="sr-only">
              {label}
            </span>
            {description ? (
              <span id={descriptionId} className="sr-only">
                {description}
              </span>
            ) : null}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
