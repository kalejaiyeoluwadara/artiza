"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";

/**
 * The claim page's own error boundary.
 *
 * Without one, a crash anywhere under `/join` falls through to the framework's
 * default error screen — a bare "Application error: a client-side exception has
 * occurred" on a white page, to an artisan who has never seen Artiza and was
 * told this would take two minutes. That screen tells them nothing, offers
 * nothing, and doesn't look like the page they were on a second ago.
 *
 * This one answers the three questions a failure has to answer: what happened,
 * whether anything they typed reached us, and what to do now. It is honest that
 * a reload loses the form — pretending otherwise would be worse than saying so
 * — and it offers the team as the way through, because for a founding artisan
 * the phone call is a real alternative to the form.
 */
export default function JoinError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only thread back to the server-side stack trace, so it
    // goes to the console and onto the screen rather than being swallowed.
    console.error("[join] page crashed", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-16 md:px-6 md:pb-20 md:pt-24">
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-card text-danger ring-1 ring-danger"
      >
        <TriangleAlert size={22} strokeWidth={2.2} />
      </span>

      <h1 className="title-lg mt-5 text-ink">This form stopped working</h1>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-sub">
        Something on Artiza&apos;s side broke while you were filling this in —
        it isn&apos;t anything you did, and nothing you typed was sent to us.
        Try it again below. If it breaks a second time, call the Artiza team and
        we&apos;ll take your details over the phone and list you ourselves.
      </p>

      <button
        type="button"
        onClick={reset}
        className="pressable hover-dim mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white"
      >
        <RotateCw size={18} strokeWidth={2.4} aria-hidden />
        Try the form again
      </button>

      <Link
        href="/"
        className="pressable hover-fill mt-3 block w-full rounded-full bg-fill py-3.5 text-center text-[1.0625rem] font-semibold text-ink"
      >
        See Artiza instead
      </Link>

      {error.digest ? (
        <p className="caption mt-6 text-center text-faint">
          Quote reference{" "}
          <span className="figure text-sub">{error.digest}</span> if you call
          the team.
        </p>
      ) : null}
    </div>
  );
}
