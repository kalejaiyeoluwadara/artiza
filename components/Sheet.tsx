"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
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

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** False through SSR and the hydration pass, true once on the client. */
const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

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

  // Callers pass inline arrows, so `onClose` is a new function every
  // render. Reading it through a ref keeps it out of the effect's deps —
  // otherwise the effect below tore down and re-ran on every render,
  // re-arming the scroll lock and resetting the drag mid-gesture.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // `position: fixed` is only relative to the viewport if no ancestor has
  // a transform, filter or `will-change` on one of them — any of those make
  // that ancestor the containing block instead, which parks the sheet at
  // the bottom of the *page* rather than the screen. A portal to <body>
  // takes the sheet out of the page tree so no ancestor can ever do that.
  const hydrated = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  // Distance the sheet travels to sit fully off-screen, and the range the
  // scrim reads. Seeded from the viewport so the very first open still
  // slides in from below the fold, then corrected to the sheet's own
  // height once there is something to measure. The seed never reaches the
  // server's HTML — nothing renders until `hydrated`.
  const [travel, setTravel] = useState(() =>
    typeof window === "undefined" ? 800 : window.innerHeight,
  );

  // Measured on mount and kept current, so the exit animates to an exact
  // pixel target and the dismiss threshold is a real fraction of the sheet.
  // Content can grow after mount (a profile's photos landing), hence the
  // observer rather than a one-shot read.
  const measure = useCallback((node: HTMLDivElement | null) => {
    sheetRef.current = node;
    if (!node) return;

    setTravel(node.offsetHeight);
    const observer = new ResizeObserver(() => setTravel(node.offsetHeight));
    observer.observe(node);

    return () => {
      observer.disconnect();
      sheetRef.current = null;
    };
  }, []);

  // Release velocity is handed to the exit spring, so there is no seam
  // between the finger letting go and the sheet flying out. It rides on
  // `exit` rather than the shared transition, so a fling never leaks into
  // the next open's entrance.
  const [exitVelocity, setExitVelocity] = useState(0);

  // Every close that isn't a fling starts the exit from rest.
  const close = useCallback(() => {
    setExitVelocity(0);
    closeRef.current();
  }, []);

  // One motion value drives the whole scrim: it fades in as the sheet
  // rises, tracks a drag, and fades out on the way down. Giving it
  // `animate`/`exit` opacity as well would fight this, since a motion
  // value in `style` takes precedence over the animation props.
  const scrim = useTransform(y, [0, Math.max(travel, 1)], [1, 0]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus has to land inside an aria-modal dialog, or a screen reader and
    // the Tab key both stay out on the page behind the scrim.
    sheetRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const stops = Array.from(
        sheet.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (stops.length === 0) {
        e.preventDefault();
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      // Wrap at both ends so Tab never walks out onto the inert page.
      if (e.shiftKey && (active === first || active === sheet)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Removing the scrollbar would otherwise shift the page under the
    // scrim on desktop, so its width is given back as padding.
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      previouslyFocused?.focus?.();
    };
  }, [open, close]);

  if (!hydrated) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-100">
          {/* Dimming scrim: this is a modal task, so the background gets
              pushed back rather than staying live. */}
          <motion.button
            type="button"
            aria-label={`Close ${label}`}
            onClick={close}
            className="absolute inset-0 w-full cursor-default bg-black/35"
            {...(reduceMotion
              ? {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.15 },
                }
              : { style: { opacity: scrim } })}
          />

          <motion.div
            ref={measure}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88svh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-canvas shadow-[0_-8px_40px_rgba(0,0,0,0.6)] outline-none"
            style={{ y }}
            // Kept numeric — a "100%" string here would land in `y` and
            // feed the scrim's transform a value it can't interpolate.
            initial={reduceMotion ? { opacity: 0 } : { y: travel }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    y: travel,
                    transition: { ...DRAWER_SPRING, velocity: exitVelocity },
                  }
            }
            transition={reduceMotion ? { duration: 0.15 } : DRAWER_SPRING}
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
              if (projected > travel * 0.4) {
                setExitVelocity(info.velocity.y);
                closeRef.current();
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
    </AnimatePresence>,
    document.body,
  );
}
