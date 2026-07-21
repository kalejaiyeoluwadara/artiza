"use client";

import { useMemo, useState } from "react";
import { ARTISANS, TRADE_LABELS, Trade, rankArtisans } from "../lib/artisans";
import { ArtisanCard } from "./ArtisanCard";

const TRADES = Object.keys(TRADE_LABELS) as Trade[];

export function ArtisanBrowser() {
  const [trade, setTrade] = useState<Trade | null>(null);

  const results = useMemo(
    () => rankArtisans(ARTISANS.filter((a) => !trade || a.trade === trade)),
    [trade]
  );

  return (
    <section aria-labelledby="register" className="mt-16 md:mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="register" className="type-display text-h2 text-bone">
          The register
        </h2>
        <p className="text-sm text-smoke">
          <span className="type-figure text-bone">{results.length}</span>{" "}
          {results.length === 1 ? "artisan" : "artisans"}
          {trade ? ` under ${TRADE_LABELS[trade].toLowerCase()}` : " on record"}
        </p>
      </div>

      {/* Pills mean "toggle" — the one place a full radius is allowed. */}
      <div className="-mx-6 mt-5 overflow-x-auto px-6 pb-1 md:mx-0 md:px-0">
        <div className="flex w-max gap-2">
          <Chip active={trade === null} onClick={() => setTrade(null)}>
            All trades
          </Chip>
          {TRADES.map((t) => (
            <Chip key={t} active={trade === t} onClick={() => setTrade(t)}>
              {TRADE_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-8 rounded-sm border border-line bg-ash p-8 text-center text-sm text-smoke">
          No {trade && TRADE_LABELS[trade].toLowerCase()} listed in Ilisan yet.
          Pick another trade, or check back — the team adds artisans weekly.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((artisan) => (
            <li key={artisan.id}>
              <ArtisanCard artisan={artisan} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
        active
          ? "border-brass bg-brass text-ink"
          : "hover-surface border-line bg-ash text-smoke"
      }`}
    >
      {children}
    </button>
  );
}
