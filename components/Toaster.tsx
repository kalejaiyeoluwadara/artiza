"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import {
  dismiss,
  pauseTimers,
  resumeTimers,
  useToasts,
  type Toast,
  type ToastVariant,
} from "../lib/toast";

/**
 * Apple's momentum projection — the same function the sheet uses. A fast flick
 * dismisses, a slow drag snaps back, regardless of distance travelled.
 */
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Critically damped. A toast arrives on its own — no gesture preceded it — so
 * per the apple-design table it settles without overshoot. Bounce is reserved
 * for the drag-dismiss, where the finger earned it.
 */
const TOAST_SPRING = { type: "spring" as const, bounce: 0, duration: 0.4 };

/** Past this fraction of the card's height, a downward drag commits. */
const DISMISS_RATIO = 0.5;

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

const VARIANT_ICON: Record<ToastVariant, typeof Check> = {
  success: Check,
  error: TriangleAlert,
  info: Info,
  loading: Info,
};

/**
 * One accent, per the style guide: emerald carries success the same way it
 * carries money and verification. Danger is the only other colour, and it is
 * state — never decoration.
 */
const VARIANT_STYLE: Record<ToastVariant, string> = {
  success: "bg-accent-soft text-accent",
  error: "bg-danger/10 text-danger",
  info: "bg-fill text-sub",
  loading: "bg-fill text-sub",
};

export function Toaster() {
  const toasts = useToasts();
  const hydrated = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  // A pointer resting on the stack pauses every timer. If this unmounts while
  // paused — a route change under the finger — the timers would stay frozen
  // and the toasts would never leave, so the pause is released on the way out.
  useEffect(() => resumeTimers, []);

  if (!hydrated || toasts.length === 0) return null;

  return createPortal(
    <div
      // The tab bar is the app's floor on mobile, so the stack sits above it;
      // on desktop the bar is gone and it drops to the normal gutter.
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[110] flex flex-col items-center gap-2 px-4 md:bottom-6"
      onPointerEnter={pauseTimers}
      onPointerLeave={resumeTimers}
      onFocusCapture={pauseTimers}
      onBlurCapture={resumeTimers}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const reduceMotion = useReducedMotion();
  const Icon = VARIANT_ICON[toast.variant];

  const motionProps = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        // Enters upward from below and leaves the same way — a thing that
        // came from down there goes back down there.
        initial: { opacity: 0, y: 24, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.96 },
        transition: TOAST_SPRING,
      };

  return (
    <motion.div
      layout
      // Errors interrupt; everything else waits its turn in the queue.
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className="pointer-events-auto w-full max-w-[26rem] touch-none rounded-2xl bg-card p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-line"
      {...motionProps}
      drag={reduceMotion ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.02, bottom: 0.6 }}
      onDragEnd={(_, info) => {
        const projected = info.offset.y + project(info.velocity.y);
        if (projected > 56 * DISMISS_RATIO) dismiss(toast.id);
      }}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`flex size-7 shrink-0 items-center justify-center rounded-full ${VARIANT_STYLE[toast.variant]}`}
        >
          {toast.variant === "loading" ? (
            <Spinner />
          ) : (
            <Icon size={15} strokeWidth={2.6} />
          )}
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="headline text-ink">{toast.title}</p>
          {toast.description ? (
            <p className="caption mt-0.5 text-pretty">{toast.description}</p>
          ) : null}

          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                dismiss(toast.id);
              }}
              className="pressable mt-2 rounded-full bg-fill px-3.5 py-1.5 text-[0.8125rem] font-semibold text-ink"
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>

        {/* A pinned toast has no timer, so it needs a way out. */}
        {toast.duration === null && toast.variant !== "loading" ? (
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="pressable -mt-0.5 -mr-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-faint hover:text-sub"
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

/** Ring spinner. `motion-safe` so reduced motion gets a static mark instead. */
function Spinner() {
  return (
    <span
      aria-hidden
      className="size-3.5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
    />
  );
}
