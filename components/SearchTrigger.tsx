"use client";

import { useRouter } from "next/navigation";

/**
 * Artiza's own magnifier, drawn to the same grid as the tab icons — 24
 * units, a 6.75 lens, round caps — so the header and the tab bar are
 * unmistakably the same set.
 *
 * The difference is that this one is alive. At rest it is the plain
 * glyph; on approach the whole magnifier makes one short scan across
 * the field while a glint travels the rim, then settles. It runs once
 * per hover rather than looping: a permanently moving icon in the
 * header would compete with the catalogue for attention, and the point
 * of the motion is only to say "this searches" before the click.
 */
function SearchGlyph() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className="search-glyph shrink-0"
    >
      <g
        className="search-glyph__body"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      >
        <circle cx="10.9" cy="10.9" r="6.75" />
        <path className="search-glyph__handle" d="M15.7 15.7 20.25 20.25" />
        {/* The glint: a short arc of the same circle, parked out of sight
            behind the ring until the sweep spins it around the rim. */}
        <circle
          className="search-glyph__glint"
          cx="10.9"
          cy="10.9"
          r="6.75"
          strokeWidth={2.1}
          strokeDasharray="8 34.4"
          strokeDashoffset="0"
          opacity="0"
        />
      </g>
    </svg>
  );
}

/**
 * The header's way into search. It is shaped like a field because that
 * is what the shape promises — but there is nothing to type into here:
 * the real query lives on `/search`, where results land on the keystroke
 * against the register already in memory. So the field is a doorway.
 * Clicking it, pressing enter in it, or starting to type in it all do
 * the same thing: open search, with the caret already waiting.
 *
 * Focus alone does not navigate — tabbing through the header should pass
 * over this, not teleport out of the page.
 */
export function SearchTrigger({ className = "" }: { className?: string }) {
  const router = useRouter();

  function open() {
    router.push("/search");
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        open();
      }}
      className={className}
    >
      <label className="search-trigger flex cursor-text items-center gap-2.5 rounded-full bg-card px-4 py-2 text-sub transition-colors duration-200 ease-out focus-within:text-ink">
        <SearchGlyph />
        <input
          type="search"
          readOnly
          placeholder="Search artisans, trades, areas"
          aria-label="Search artisans"
          // The route is a click away and always the same one, so warm it
          // on approach rather than on mount.
          onPointerEnter={() => router.prefetch("/search")}
          onMouseDown={(event) => {
            // Navigate on press rather than on the focus that follows it,
            // so the caret lands on the real field, not this stand-in.
            event.preventDefault();
            open();
          }}
          onKeyDown={(event) => {
            // Someone who starts typing here meant to search; carry them
            // over rather than swallowing the keystroke.
            if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
              event.preventDefault();
              open();
            }
          }}
          className="w-full min-w-0 cursor-text bg-transparent text-[0.9375rem] text-ink placeholder:text-sub focus:outline-none"
        />
      </label>
    </form>
  );
}
