"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useFavorites } from "../lib/useFavorites";

/**
 * The home screen's header: who you are on the left, what you've saved on the
 * right.
 *
 * A greeting rather than a title because home is the one screen that doesn't
 * need naming — you are looking at it. The hours below are deliberately blunt
 * (a 4am tap gets "Good evening", not "Good night"): the greeting's job is to
 * feel addressed to you, and the register is what the screen is actually for.
 */
export function HomeGreeting() {
  const { data: session } = useSession();
  const { count } = useFavorites();

  // Only the first name — "Good morning, Oluwadara Kalejaiye." reads like a
  // letter from a bank.
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="
        text-2xl font-bold mt-1 leading-[1.28] text-ink">
          {greeting()}
          {firstName ? (
            <>
              ,{" "}
              {/* The name wraps as one unit — a first name split across two
                  lines is the sort of thing that reads as broken. */}
                  
              <span className="whitespace-nowrap">{firstName}</span>
            </>
          ) : null}
          !
        </h1>
      </div>

      <Link
        href="/favorites"
        aria-label={count > 0 ? `Favourites, ${count} saved` : "Favourites"}
        className="pressable hover-fill relative grid size-11 shrink-0 place-items-center rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      >
        <svg
          viewBox="0 0 22 22"
          className="size-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M11 18.6S3 13.9 3 8.4A4.4 4.4 0 0 1 11 5.9a4.4 4.4 0 0 1 8 2.5c0 5.5-8 10.2-8 10.2Z" />
        </svg>

        {/* A count, not a dot: how many you saved is the useful part, and a
            bare dot on a screen you visit constantly is just a nag. */}
        {count > 0 ? (
          <span className="figure absolute -right-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.6875rem] font-bold text-white ring-2 ring-canvas">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

/**
 * The hour in Ilisan — not the hour on the device, and not the hour on the
 * server.
 *
 * `new Date().getHours()` would be a hydration mismatch waiting to happen: the
 * server renders in UTC and the browser in whatever the device is set to, so
 * around any boundary the two disagree and React throws the markup away.
 * Pinning the zone makes both sides compute the same number — and it is the
 * more correct answer anyway, since the whole register is in one town.
 */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function placeLine(): string {
  return "Ilisan, Ogun State";
}
