"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The large title every screen opens with — and the compact bar it becomes.
 *
 * A bare `.title-lg` on canvas is the whole header today, which leaves the top
 * of every screen saying nothing but its own name. Three things fix that
 * without adding chrome for its own sake: an eyebrow that says *where* (the
 * app is one town, and that is the promise), a subtitle that says what the
 * screen actually holds, and a slot for the one action that belongs up here.
 *
 * Then it does the iOS thing: once the large title scrolls away on mobile, it
 * collapses into a translucent bar carrying the same words. Mobile had no top
 * chrome at all, so scrolling any distance meant losing track of which tab you
 * were in — the bar is wayfinding, not decoration. Desktop already has
 * `SiteHeader`, so it stays out of the way there.
 */
export function PageHeader({
  eyebrow,
  title,
  compactTitle,
  subtitle,
  action,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  /** Shorter wording for the collapsed bar, when the large title is a phrase. */
  compactTitle?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = sentinel.current;
    if (!mark) return;

    // An observer rather than a scroll listener: the browser does the work off
    // the main thread, so the bar cannot become the reason scrolling stutters.
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(mark);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        // `fixed` rather than sticky so it never occupies a strip of layout
        // while hidden, and never nudges the content under it on the way in.
        className={`chrome fixed inset-x-0 top-0 z-40 border-b border-line transition-[opacity,transform] duration-200 ease-out md:hidden ${
          collapsed
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        // Hidden from the reading order in both states: it is a duplicate of
        // the <h1> below, and a screen reader gains nothing from hearing the
        // screen's name twice.
        aria-hidden
      >
        <div className="flex h-12 items-center gap-3 px-4">
          <span className="headline min-w-0 flex-1 truncate text-ink">
            {compactTitle ?? title}
          </span>
          {action ? <span className="shrink-0">{action}</span> : null}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="caption mb-1.5 flex items-center gap-1.5">{eyebrow}</p>
          ) : null}

          <h1 className="title-lg text-ink">{title}</h1>

          {subtitle ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-sub">
              {subtitle}
            </p>
          ) : null}
        </div>

        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>

      {/* Watched, not drawn. Once this passes the top edge the large title has
          gone with it, which is exactly when the bar should take over. */}
      <div ref={sentinel} aria-hidden className="h-px" />
    </>
  );
}

/**
 * The eyebrow's place mark. A filled dot in the trade-illustration green would
 * read as a status light, so it is drawn as a pin outline in `sub` — the same
 * weight as the words beside it.
 */
export function PlaceMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 14.5s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z" />
      <circle cx="8" cy="6.5" r="1.9" />
    </svg>
  );
}
