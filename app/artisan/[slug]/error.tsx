"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";

/**
 * The shared-profile boundary.
 *
 * A missing artisan is a 404 and already has a page; this is the other
 * failure — the register couldn't be read at all, because the API is down or
 * the connection went. It matters more here than on a tab inside the app: this
 * is where a link from a WhatsApp chat lands, often on someone's first ever
 * visit, and the framework's default error screen would be their whole
 * impression of Artiza. So it says what happened, and offers the two things
 * that might work — the same read again, or the register itself.
 */
export default function ArtisanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[artisan] profile page failed", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-16 pb-28 md:pb-16">
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full bg-card text-danger ring-1 ring-danger"
      >
        <TriangleAlert size={22} strokeWidth={2.2} />
      </span>

      <h1 className="title-lg mt-5 text-ink">This profile didn&apos;t load</h1>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-pretty text-sub">
        The artisan is still listed — Artiza just couldn&apos;t reach their
        record. Try again, or open the register and find them by trade.
      </p>

      <button
        type="button"
        onClick={reset}
        className="pressable hover-dim mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-[1.0625rem] font-semibold text-white"
      >
        <RotateCw size={18} strokeWidth={2.4} aria-hidden />
        Try again
      </button>

      <Link
        href="/"
        className="pressable hover-fill mt-3 block w-full rounded-full bg-fill py-3.5 text-center text-[1.0625rem] font-semibold text-ink"
      >
        Browse every artisan in Ilisan
      </Link>

      {error.digest ? (
        <p className="caption mt-6 text-center text-faint">
          Reference <span className="figure text-sub">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}
