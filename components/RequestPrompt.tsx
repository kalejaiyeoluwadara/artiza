"use client";

import { UserRoundSearch } from "lucide-react";

/**
 * The offer to go looking, shown wherever the register came up short.
 *
 * A dead end is the most expensive screen in the app — it is the one place a
 * customer learns Artiza can't help — so it never just states the absence.
 * Every one of them ends in the same sentence: tell us, and we'll find them.
 *
 * Two weights, because it sits in two very different moments:
 *
 *  - **`loud`** — the search or filter that returned nothing. This is the
 *    screen's whole content, so it carries the accent pill and the argument.
 *  - **`quiet`** — the standing prompt under a screen that *did* find things.
 *    Nobody's plans were ruined, so it is a single line and a text action; an
 *    accent button at the foot of a working browse screen would be a second
 *    primary action competing with the artisans above it.
 *
 * The accent wash on the loud variant is the one gradient in the app that isn't
 * a scrim. It reads as a lit surface rather than another grey slab, which is
 * what stops the failure state from looking like the failure it describes.
 */
export function RequestPrompt({
  heading,
  body,
  cta = "Ask us to find someone",
  onAsk,
  secondary,
  tone = "loud",
}: {
  heading: string;
  body: string;
  cta?: string;
  onAsk: () => void;
  /** The other way out — clearing a search, dropping a filter. */
  secondary?: { label: string; onSelect: () => void };
  tone?: "loud" | "quiet";
}) {
  if (tone === "quiet") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-card px-4 py-3.5">
        <UserRoundSearch
          size={17}
          strokeWidth={2}
          aria-hidden
          className="shrink-0 text-sub"
        />
        <p className="min-w-0 flex-1 text-[0.9375rem] text-sub">
          <span className="font-semibold text-ink">{heading}</span> {body}
        </p>
        <button
          type="button"
          onClick={onAsk}
          className="pressable shrink-0 text-[0.8125rem] font-semibold text-accent"
        >
          {cta}
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-card p-6 text-center sm:p-8"
      style={{
        // Tokens through the CSS variable, so the wash tracks the one accent.
        backgroundImage:
          "radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 62%)",
      }}
    >
      <span
        aria-hidden
        className="mx-auto grid size-12 place-items-center rounded-full bg-accent-soft text-accent"
      >
        <UserRoundSearch size={22} strokeWidth={2} />
      </span>

      <h3 className="headline mt-4 text-ink">{heading}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[0.9375rem] leading-relaxed text-sub">
        {body}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onAsk}
          className="pressable rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          {cta}
        </button>
        {secondary ? (
          <button
            type="button"
            onClick={secondary.onSelect}
            className="pressable hover-fill rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink"
          >
            {secondary.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
