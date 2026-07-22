"use client";

import { BadgeCheck, Sparkle, Star, TrendingUp } from "lucide-react";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { Avatar } from "./ArtisanCard";
import { ArtisanCover } from "./ArtisanCover";

export type RailKind = "trending" | "new" | "top-rated";

/**
 * The three sorted ways into the register — trending, new, top rated. One
 * component because they differ in exactly one thing: the number each card
 * leads with. Three near-identical rails written three times would drift.
 *
 * They sit below Featured, so the card is deliberately quieter than the
 * featured slot: a small work photo, the portrait lapping it, and one figure.
 */
export function DiscoveryRail({
  kind,
  artisans,
  onOpen,
}: {
  kind: RailKind;
  artisans: Artisan[];
  onOpen: (artisan: Artisan) => void;
}) {
  if (artisans.length === 0) return null;

  const { heading, rule } = RAILS[kind];
  const headingId = `rail-${kind}-heading`;

  return (
    <section aria-labelledby={headingId} className="mt-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="title text-ink">
          {heading}
        </h2>
        {/* Says what put them here. A ranked rail with no stated rule is
            just an assertion. */}
        <p className="caption shrink-0">{rule}</p>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 md:mx-0 md:scroll-px-0 md:px-0">
        <ul className="flex w-max gap-3">
          {artisans.map((artisan) => (
            <li key={artisan.id} className="snap-start">
              <RailCard
                artisan={artisan}
                kind={kind}
                onOpen={() => onOpen(artisan)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Exported so the loading skeleton can carry the real headings. */
export const RAILS: Record<RailKind, { heading: string; rule: string }> = {
  trending: { heading: "Trending", rule: "Last 30 days" },
  new: { heading: "New on Artiza", rule: "Recently verified" },
  "top-rated": { heading: "Top rated", rule: "15+ reviews" },
};

function RailCard({
  artisan,
  kind,
  onOpen,
}: {
  artisan: Artisan;
  kind: RailKind;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable group flex h-full w-44 flex-col overflow-hidden rounded-2xl bg-card text-left"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-fill">
        <ArtisanCover
          artisan={artisan}
          sizes="176px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/25 via-black/0 to-black/15"
        />
      </div>

      <div className="flex w-full flex-1 flex-col p-3">
        {/* Same lapping portrait as the list card, scaled down — the rails
            should read as the same object, smaller. */}
        <Avatar
          name={artisan.name}
          src={artisan.photo}
          size="size-10"
          className="relative z-10 -mt-9 ring-4 ring-card"
        />

        <h3 className="headline mt-2 flex items-center gap-1 text-[0.9375rem] text-ink">
          <span className="truncate">{artisan.name}</span>
          <BadgeCheck
            size={14}
            strokeWidth={2.2}
            className="shrink-0 text-accent"
            aria-label="Verified"
          />
        </h3>
        <p className="caption mt-0.5 truncate">
          {TRADE_LABELS[artisan.trade]} · {artisan.location}
        </p>

        <div className="mt-2 flex-1" />
        <Signal artisan={artisan} kind={kind} />
      </div>
    </button>
  );
}

/** The one number the rail sorted on, said plainly. */
function Signal({ artisan, kind }: { artisan: Artisan; kind: RailKind }) {
  if (kind === "new") {
    return (
      <p className="figure flex items-center gap-1 text-[0.8125rem] text-ink">
        <Sparkle
          size={13}
          strokeWidth={2.2}
          fill="currentColor"
          className="shrink-0 text-accent"
          aria-hidden
        />
        <span className="font-normal text-sub">Verified</span>
        {artisan.verifiedSince}
      </p>
    );
  }

  if (kind === "top-rated") {
    return (
      <p className="figure flex items-center gap-1 text-[0.8125rem] text-ink">
        <Star
          size={13}
          strokeWidth={2.2}
          fill="currentColor"
          className="shrink-0 text-accent"
          aria-hidden
        />
        {artisan.rating.toFixed(1)}
        <span className="font-normal text-sub">
          from {artisan.reviewCount} reviews
        </span>
      </p>
    );
  }

  return (
    <p className="figure flex items-center gap-1 text-[0.8125rem] text-ink">
      <TrendingUp
        size={13}
        strokeWidth={2.2}
        className="shrink-0 text-accent"
        aria-hidden
      />
      {artisan.recentUnlocks}
      <span className="font-normal text-sub">unlocked this month</span>
    </p>
  );
}
