import Link from "next/link";

/**
 * The 404.
 *
 * Root `not-found.tsx` catches both `notFound()` calls inside a segment and
 * any URL the app doesn't route at all, so it has to work for a mistyped
 * address and for an artisan who was taken down — the copy names both.
 *
 * It reads as a catalogue page rather than an error page: a rail of posters
 * with the middle slot missing, and the display voice beside it. The art is
 * drawn in CSS, not photographed — a 404 shouldn't pull an image over a
 * connection that may already be the reason someone is here. Motion is left to
 * the global page transition; the frequency budget doesn't stretch to a
 * bespoke entrance for a dead end.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 pb-28 pt-10 md:px-6 md:pb-16 md:pt-16">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
        {/* Type first in the source, and on desktop it stays left — the same
            move the billboard makes at `md`. On mobile the art leads, because
            a wall of words is a worse landing than a picture of the gap. */}
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="caption uppercase tracking-[0.14em] text-faint">
            Error 404
          </p>

          <h1 className="display mt-3 text-balance text-ink">
            This page isn&rsquo;t in the{" "}
            <span className="display-accent">catalogue</span>.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-pretty text-sub md:mx-0">
            The link may be old, or the artisan may have been taken down.
            Everyone still listed in Ilisan is on the home screen.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href="/"
              className="pressable hover-dim rounded-full bg-accent px-5 py-2.5 text-[0.9375rem] font-semibold text-white"
            >
              Browse artisans
            </Link>
            <Link
              href="/search"
              className="pressable hover-fill rounded-full bg-fill px-5 py-2.5 text-[0.9375rem] font-semibold text-ink"
            >
              Search by trade
            </Link>
          </div>

          <p className="caption mt-6">
            Looking for something you kept?{" "}
            {/* Underlined at rest rather than on hover: `hover:` isn't gated
                behind a fine pointer, so a tapped link would keep the state,
                and a text link inside a sentence needs the affordance anyway. */}
            <Link
              href="/favorites"
              className="hover-dim text-ink underline decoration-line underline-offset-4"
            >
              Your list
            </Link>{" "}
            and{" "}
            <Link
              href="/unlocked"
              className="hover-dim text-ink underline decoration-line underline-offset-4"
            >
              unlocked contacts
            </Link>{" "}
            are still there.
          </p>
        </div>

        <MissingPoster />
      </div>
    </div>
  );
}

/**
 * A rail with a hole in it: two posters angled away from centre and the slot
 * between them empty. The flanking tiles carry a poster's furniture — scrim,
 * name bar, meta bar — at low contrast, so the shape reads as *this app's*
 * poster and not as a generic grey card. They're `aria-hidden`; the heading
 * beside them already says what happened.
 */
function MissingPoster() {
  return (
    <div
      aria-hidden
      className="order-1 flex items-center justify-center gap-3 md:order-2 md:gap-4"
    >
      <GhostPoster className="-rotate-6 translate-y-3 opacity-40" />

      {/* The gap. `line` at a dashed edge rather than a filled card: an empty
          slot has to look like nothing arrived, not like something loaded. */}
      <div className="relative aspect-2/3 w-28 shrink-0 rounded-lg border border-dashed border-line sm:w-36 lg:w-40">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <span className="figure text-[1.75rem] leading-none text-faint sm:text-[2rem]">
            404
          </span>
          <span className="caption text-faint">No listing</span>
        </div>
      </div>

      <GhostPoster className="rotate-6 translate-y-3 opacity-40" />
    </div>
  );
}

function GhostPoster({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative aspect-2/3 w-20 shrink-0 overflow-hidden rounded-lg bg-card sm:w-24 lg:w-28 ${className}`}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-2.5">
        <div className="h-2 w-3/4 rounded-full bg-fill" />
        <div className="h-1.5 w-1/2 rounded-full bg-fill" />
      </div>
    </div>
  );
}
