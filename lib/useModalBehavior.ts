"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * The three things every modal surface owes the keyboard and the page beneath
 * it: focus goes in and stays in, Escape gets out, and the page behind stops
 * scrolling. Shared by the sheet and the dialog so the two can never drift.
 *
 * `onClose` is read through a ref because callers pass inline arrows — a new
 * function every render would tear this effect down and re-arm the scroll lock
 * on each pass.
 */
export function useModalBehavior({
  open,
  onClose,
  surfaceRef,
  autoFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  /** The dialog element itself — the focus trap's boundary. */
  surfaceRef: RefObject<HTMLElement | null>;
  /** Where focus should land on open. Defaults to the surface. */
  autoFocusRef?: RefObject<HTMLElement | null>;
}) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus has to land inside an aria-modal dialog, or a screen reader and
    // the Tab key both stay out on the page behind the scrim.
    (autoFocusRef?.current ?? surfaceRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const surface = surfaceRef.current;
      if (!surface) return;

      const stops = Array.from(
        surface.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

      if (stops.length === 0) {
        event.preventDefault();
        return;
      }

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;

      // Wrap at both ends so Tab never walks out onto the inert page.
      if (event.shiftKey && (active === first || active === surface)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Removing the scrollbar would otherwise shift the page under the scrim on
    // desktop, so its width is given back as padding.
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
  }, [open, surfaceRef, autoFocusRef]);
}

/** False through SSR and hydration, true once on the client. */
export const NEVER_CHANGES = () => () => {};
export const onClient = () => true;
export const onServer = () => false;
