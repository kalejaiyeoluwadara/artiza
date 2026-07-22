"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDown, Search, Sparkle, Star, TrendingUp, X } from "lucide-react";
import {
  Artisan,
  Banner,
  Filters,
  NO_FILTERS,
  TRADE_LABELS,
  Trade,
  activeFilterCount,
  filterArtisans,
  newArtisans,
  rankArtisans,
  topRatedArtisans,
  trendingArtisans,
} from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useFavorites } from "../lib/useFavorites";
import { useUnlocks } from "../context/UnlocksContext";
import { ArtisanSheet } from "./ArtisanSheet";
import { FilterSheet } from "./SearchBar";
import { HomeBillboard } from "./HomeBillboard";
import { POSTER_WIDTH, Poster, PosterRail, RatingSignal } from "./Poster";

/** How many artisans a trade needs before it earns a row of its own. */
const TRADE_RAIL_MIN = 3;

/**
 * Home, running Netflix's layout grammar: a billboard on one promoted
 * artisan, then dense stacked poster rails, each one a different cut of the
 * same register.
 *
 * The structural bet Netflix makes is that browsing is the product — you are
 * not meant to arrive knowing what you want. That maps onto Artiza cleanly:
 * someone with a leak knows they need a plumber but has no idea which one, and
 * rails are an argument for who to look at first. What does *not* map is
 * Netflix's endless catalogue — Ilisan has one town's worth of artisans, so
 * the rails run out, and every one of them hides itself rather than padding.
 */
export function NetflixHome({
  artisans: initialArtisans,
  banners: initialBanners,
}: {
  /* Read on the server by app/page.tsx. Both are optional: if the API was
     unreachable there, the hooks below fall back to fetching from the browser
     and the screen behaves as it always did. */
  artisans?: Artisan[];
  banners?: Banner[];
}) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { artisans, loading, error, retry } = useArtisans(initialArtisans);
  const { isUnlocked, unlock } = useUnlocks();
  const { ids: favoriteIds, ready: favoritesReady } = useFavorites();

  const browsing = activeFilterCount(filters) === 0;

  /* The billboard is the top promoted artisan — same ranking the register
     uses, so the slot is bought the same way the Featured rail is. */
  const billboard = useMemo(() => rankArtisans(artisans)[0] ?? null, [artisans]);

  const trending = useMemo(() => trendingArtisans(artisans), [artisans]);
  const arrivals = useMemo(() => newArtisans(artisans), [artisans]);
  const topRated = useMemo(() => topRatedArtisans(artisans), [artisans]);

  /* Netflix's Top 10 is a strict count, not a window — it is always ten, and
     the rank is the entire point. Demand, not reputation. */
  const topTen = useMemo(
    () =>
      [...artisans]
        .sort((a, b) => b.recentUnlocks - a.recentUnlocks)
        .slice(0, 10),
    [artisans],
  );

  /* Favourites are this device's, so they only exist after hydration —
     rendering the rail before then would mismatch the server's empty pass. */
  const saved = useMemo(
    () =>
      favoritesReady
        ? favoriteIds
            .map((id) => artisans.find((a) => a.id === id))
            .filter((a): a is Artisan => a !== undefined)
        : [],
    [favoriteIds, favoritesReady, artisans],
  );

  /* Netflix stacks several near-identical genre rows and lets the genre carry
     the difference. The trade is Artiza's genre, so each one with enough
     artisans to be worth scrolling gets its own row, busiest trade first. */
  const tradeRails = useMemo(() => {
    const byTrade = new Map<Trade, Artisan[]>();
    for (const artisan of artisans) {
      byTrade.set(artisan.trade, [...(byTrade.get(artisan.trade) ?? []), artisan]);
    }
    return [...byTrade.entries()]
      .filter(([, list]) => list.length >= TRADE_RAIL_MIN)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([trade, list]) => ({ trade, artisans: rankArtisans(list) }));
  }, [artisans]);

  const results = useMemo(
    () => rankArtisans(filterArtisans(artisans, filters)),
    [artisans, filters],
  );

  return (
    <div className="min-h-screen pb-28 md:pb-16">
      <TopBar filters={filters} onChange={setFilters} onOpenFilters={() => setFiltersOpen(true)} />

      <div className="mx-auto w-full max-w-[96rem] md:px-8 lg:px-12">
        {error ? (
          <Failed onRetry={retry} />
        ) : loading ? (
          <BillboardSkeleton />
        ) : browsing ? (
          <>
            <HomeBillboard
              artisan={billboard}
              banners={initialBanners}
              onOpen={() => billboard && setSelected(billboard)}
            />

            {/* Netflix's "Continue watching" sits above everything the
                algorithm picked, because a thing you already chose beats a
                thing chosen for you. Saved artisans are the same claim. */}
            <PosterRail
              heading="Your list"
              artisans={saved}
              signal={(a) => <RatingSignal artisan={a} />}
              onOpen={setSelected}
            />

            <PosterRail
              heading="Trending now"
              artisans={trending}
              signal={(a) => (
                <>
                  <TrendingUp size={13} strokeWidth={2.4} aria-hidden />
                  {a.recentUnlocks}
                  <span className="font-normal text-white/60">this month</span>
                </>
              )}
              onOpen={setSelected}
            />

            {/* Netflix prints the rank into the artwork here. Artiza's
                posters are photographs of real jobs, and a numeral laid over
                one covers the evidence the poster exists to show — so the row
                keeps the cut and drops the numbering. The order is the rank. */}
            <PosterRail
              heading="Top 10 in Ilisan today"
              artisans={topTen}
              signal={(a) => <RatingSignal artisan={a} />}
              onOpen={setSelected}
            />

            <PosterRail
              heading="New on Artiza"
              artisans={arrivals}
              signal={(a) => (
                <>
                  <Sparkle
                    size={13}
                    strokeWidth={2.4}
                    fill="currentColor"
                    aria-hidden
                  />
                  <span className="font-normal text-white/60">Verified</span>
                  {a.verifiedSince}
                </>
              )}
              onOpen={setSelected}
            />

            <PosterRail
              heading="Top rated"
              artisans={topRated}
              signal={(a) => <RatingSignal artisan={a} />}
              onOpen={setSelected}
            />

            {tradeRails.map(({ trade, artisans: list }) => (
              <PosterRail
                key={trade}
                heading={`${TRADE_LABELS[trade]}s in Ilisan`}
                action={{
                  label: "See all",
                  onSelect: () => setFilters({ ...filters, trade }),
                }}
                artisans={list}
                signal={(a) => <RatingSignal artisan={a} />}
                onOpen={setSelected}
              />
            ))}
          </>
        ) : (
          <Results
            filters={filters}
            results={results}
            onClear={() => setFilters(NO_FILTERS)}
            onOpen={setSelected}
          />
        )}
      </div>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && void unlock(selected.id, selected.name)}
      />
      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}

/**
 * Floats over the billboard art and only takes on a background once the page
 * has moved — the same trick Netflix uses so the hero starts at the very top
 * of the screen instead of below a bar.
 */
function TopBar({
  filters,
  onChange,
  onOpenFilters,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onOpenFilters: () => void;
}) {
  const { data: session } = useSession();
  const { count } = useFavorites();

  const firstName = session?.user?.name?.trim().split(/\s+/)[0];

  return (
    // Desktop already has the shared site header pinned at top-0, so only the
    // mobile bar sticks — two sticky bars at top-0 would stack on each other.
    <div className="chrome sticky top-0 z-40 md:static md:bg-transparent">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-3 px-4 md:hidden">
        <h1 className="title truncate text-ink">
          {firstName ? `For ${firstName}` : "Artiza"}
          <span className="text-accent">.</span>
        </h1>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="pressable grid size-10 place-items-center rounded-full text-ink"
          >
            <Search size={21} strokeWidth={2} aria-hidden />
          </Link>
          <Link
            href="/favorites"
            aria-label={count > 0 ? `Favourites, ${count} saved` : "Favourites"}
            className="pressable relative grid size-10 place-items-center rounded-full text-ink"
          >
            <Heart />
            {count > 0 ? (
              <span className="figure absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Netflix's Tv Series / Movies / Categories row. Every pill here is a
          real filter — an outlined pill that only says a word would be
          decoration sitting in the most prominent control slot on the page. */}
      {/* Same centred column as the billboard and the rails below — without it
          the pills stay pinned to the viewport edge past the 96rem cap while
          everything else centres, and the page loses its left edge. */}
      <div className="mx-auto w-full max-w-[96rem]">
        <div className="no-scrollbar overflow-x-auto px-4 pb-2 md:px-8 md:pt-1 lg:px-12">
          <div className="flex w-max items-center gap-2">
            {filters.trade ? (
              <Pill
                active
                onClick={() => onChange({ ...filters, trade: null })}
                label={`${TRADE_LABELS[filters.trade]}s`}
                trailing={<X size={13} strokeWidth={2.6} aria-hidden />}
              />
            ) : null}

            <Pill
              active={filters.minRating !== null}
              onClick={() =>
                onChange({
                  ...filters,
                  minRating: filters.minRating === null ? 4.5 : null,
                })
              }
              label="Top rated"
              leading={
                <Star size={12} strokeWidth={2.4} fill="currentColor" aria-hidden />
              }
            />

            <Pill
              onClick={onOpenFilters}
              label="Categories"
              trailing={<ChevronDown size={14} strokeWidth={2.4} aria-hidden />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({
  label,
  active = false,
  leading,
  trailing,
  onClick,
}: {
  label: string;
  active?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold ${
        active
          ? "border-transparent bg-ink text-canvas"
          : "chrome border-line text-ink"
      }`}
    >
      {leading}
      {label}
      {trailing}
    </button>
  );
}

/** The filtered register, as a poster grid — no rails, no billboard. */
function Results({
  filters,
  results,
  onClear,
  onOpen,
}: {
  filters: Filters;
  results: Artisan[];
  onClear: () => void;
  onOpen: (artisan: Artisan) => void;
}) {
  const heading = filters.trade
    ? `Every ${TRADE_LABELS[filters.trade].toLowerCase()} in Ilisan`
    : "Every artisan in Ilisan";

  return (
    <section aria-labelledby="results-heading" className="px-4 pt-4 md:px-0">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="results-heading" className="title text-ink">
          {heading}
        </h2>
        <p className="caption shrink-0">
          {results.length} {results.length === 1 ? "artisan" : "artisans"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-4 rounded-lg bg-card p-8 text-center">
          <p className="text-sm text-sub">
            Nothing matches. Drop a filter — the team adds artisans weekly.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="pressable hover-fill mt-4 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((artisan) => (
            <li key={artisan.id}>
              <Poster
                artisan={artisan}
                width="w-full"
                signal={<RatingSignal artisan={artisan} />}
                onOpen={() => onOpen(artisan)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Mirrors the billboard's geometry so the swap to real art is a fade.
 *
 * Exported because `app/page.tsx` now awaits the register on the server, so
 * there are two moments home has nothing to draw: that await (covered by
 * `app/loading.tsx`) and the client re-fetch when the server read failed
 * (covered here). Both render this, so home has exactly one loading shape.
 */
export function BillboardSkeleton() {
  return (
    <div className="md:px-0">
      <div className="skeleton mx-4 h-112 rounded-2xl md:mx-0 md:h-128 lg:h-[38rem]" />
      <div className="mt-6 flex gap-2.5 overflow-hidden px-4 md:px-0">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`skeleton aspect-2/3 shrink-0 rounded-lg ${POSTER_WIDTH}`}
          />
        ))}
      </div>
    </div>
  );
}

/** A read that fell over is not an empty register — it says so, and retries. */
function Failed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 pt-10 md:px-0">
      <div className="rounded-lg bg-card p-8 text-center">
        <p className="text-sm text-sub">
          The register didn&apos;t load. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="pressable hover-fill mt-4 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function Heart() {
  return (
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
  );
}
