"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  Clock,
  Hammer,
  Images,
  Search,
  Sparkle,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Artisan,
  Banner,
  Filters,
  NO_FILTERS,
  TRADE_LABELS,
  activeFilterCount,
  filterArtisans,
} from "../lib/artisans";
import { RailSignal, composeHome, rankArtisans } from "../lib/home-rails";
import { useArtisans } from "../lib/useData";
import { pinJustJoined, useJustJoined } from "../lib/applications/just-joined";
import { useFavorites } from "../lib/useFavorites";
import { useUnlocks } from "../context/UnlocksContext";
import { ApplyControl } from "./ApplyControl";
import { ArtisanSheet } from "./ArtisanSheet";
import { FilterSheet } from "./SearchBar";
import { HomeBillboard } from "./HomeBillboard";
import { POSTER_WIDTH, Poster, PosterRail, RatingSignal } from "./Poster";
import { RequestArtisanSheet } from "./RequestArtisanSheet";
import { RequestPrompt } from "./RequestPrompt";

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
 *
 * Which rails those are is decided by `composeHome` in `lib/home-rails.ts`,
 * not here: this component picks no artisans of its own any more, it renders
 * whatever rows the register could actually support. See that module for why.
 */
export function NetflixHome({
  artisans: initialArtisans,
  banners: initialBanners,
  day,
}: {
  /* Read on the server by app/page.tsx. Both are optional: if the API was
     unreachable there, the hooks below fall back to fetching from the browser
     and the screen behaves as it always did. */
  artisans?: Artisan[];
  banners?: Banner[];
  /* The rotation seed for tie-breaks, also read on the server. A prop rather
     than a `Date.now()` in here so the server pass and hydration cannot
     disagree across a UTC midnight. See `dayIndex`. */
  day: number;
}) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [selected, setSelected] = useState<Artisan | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const { artisans: register, loading, error, retry } =
    useArtisans(initialArtisans);

  /* Someone who finished `/join` seconds ago isn't in the cached register
     yet, and was just told they are live. Their profile rides across from the
     form until the register catches up, and drops out on its own when it
     does. See `lib/applications/just-joined.ts`. */
  const { artisans, joined } = useJustJoined(register);
  const { isUnlocked, unlock } = useUnlocks();
  const { ids: favoriteIds, ready: favoritesReady } = useFavorites();

  const browsing = activeFilterCount(filters) === 0;

  /* Every row on the page, in order, decided in one pass so that no artisan
     fills two discovery rails and no heading outruns its evidence. */
  const rails = useMemo(
    () =>
      composeHome(artisans, day).map((rail) =>
        /* Someone who finished `/join` seconds ago was just told they are
           live, so they ride to the front of the arrivals row until the
           register catches up. */
        rail.id === "arrivals"
          ? { ...rail, artisans: pinJustJoined(rail.artisans, joined) }
          : rail,
      ),
    [artisans, day, joined],
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

  const results = useMemo(
    () => rankArtisans(filterArtisans(artisans, filters), day),
    [artisans, filters, day],
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
            <HomeBillboard banners={initialBanners} />

            {/* Netflix's "Continue watching" sits above everything the
                algorithm picked, because a thing you already chose beats a
                thing chosen for you. Saved artisans are the same claim. */}
            <PosterRail
              heading="Your list"
              artisans={saved}
              signal={(a) => <RatingSignal artisan={a} />}
              onOpen={setSelected}
            />

            {/* Netflix prints the rank into the artwork on its Top 10.
                Artiza's posters are photographs of real jobs, and a numeral
                laid over one covers the evidence the poster exists to show —
                so that row keeps the cut and drops the numbering. The order is
                the rank. */}
            {rails.map((rail) => (
              <PosterRail
                key={rail.id}
                heading={rail.heading}
                /* Only a trade row has somewhere to send you: the same trade,
                   unfiltered. The discovery rows are already the whole of
                   what they have to say. */
                action={
                  rail.trade
                    ? {
                        label: "See all",
                        onSelect: () =>
                          setFilters({ ...filters, trade: rail.trade! }),
                      }
                    : undefined
                }
                artisans={rail.artisans}
                signal={(a) => <RailSignalFor kind={rail.signal} artisan={a} />}
                onOpen={setSelected}
              />
            ))}

            {/* The last thing on the browse screen, after every rail has had
                its say. A catalogue this size runs out — closing it with the
                offer to go and find the missing artisan is the difference
                between a short list and a list that grows. Quiet: nothing has
                gone wrong here, so it is not competing with the posters. */}
            <section
              aria-label="Ask for an artisan"
              className="mt-8 px-4 md:px-0"
            >
              <RequestPrompt
                tone="quiet"
                heading="Can't find who you need?"
                body="Tell us the trade and leave your number — the team goes looking."
                cta="Ask us"
                onAsk={() => setAsking(true)}
              />
            </section>
          </>
        ) : (
          <Results
            filters={filters}
            results={results}
            onClear={() => setFilters(NO_FILTERS)}
            onOpen={setSelected}
            onAsk={() => setAsking(true)}
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
      <RequestArtisanSheet
        open={asking}
        onClose={() => setAsking(false)}
        source="home"
        /* The trade they were filtering on, as the word they saw on the pill —
           the form takes plain text, so the label is what goes in, not the key. */
        need={filters.trade ? TRADE_LABELS[filters.trade] : undefined}
      />
    </div>
  );
}

/**
 * The number a poster prints, which is always the one its rail ranked on.
 *
 * This is the half of the de-duplication the eye actually does. Even where two
 * rows legitimately share an artisan — the top ten and their own trade row —
 * the poster reads differently in each, because it is showing why *that* row
 * chose them. A rail whose evidence were the star rating everywhere would look
 * like the same row twice however different its membership was.
 */
function RailSignalFor({
  kind,
  artisan,
}: {
  kind: RailSignal;
  artisan: Artisan;
}) {
  switch (kind) {
    case "unlocks":
      return (
        <>
          <TrendingUp size={13} strokeWidth={2.4} aria-hidden />
          {artisan.recentUnlocks}
          <span className="font-normal text-white/60">this month</span>
        </>
      );

    case "verified":
      return (
        <>
          <Sparkle size={13} strokeWidth={2.4} fill="currentColor" aria-hidden />
          <span className="font-normal text-white/60">Verified</span>
          {artisan.verifiedSince}
        </>
      );

    case "years":
      /* An artisan with no rating yet has nothing to say in stars, and a
         "0.0 (0)" under their face is worse than no line at all — so the
         record they do have stands in. Once reviews land, the rating leads. */
      return artisan.reviewCount > 0 ? (
        <RatingSignal artisan={artisan} />
      ) : (
        <>
          <Hammer size={13} strokeWidth={2.4} aria-hidden />
          {artisan.yearsExperience}
          <span className="font-normal text-white/60">
            {artisan.yearsExperience === 1 ? "year" : "years"} on the job
          </span>
        </>
      );

    case "work":
      return (
        <>
          <Images size={13} strokeWidth={2.4} aria-hidden />
          {artisan.work.length}
          <span className="font-normal text-white/60">photos of past jobs</span>
        </>
      );

    case "responds":
      return (
        <>
          <Clock size={13} strokeWidth={2.4} aria-hidden />
          <span className="font-normal text-white/60">
            {/* The stored line is a sentence — "Usually replies within an
                hour" — and the poster has room for the fact, not the prose. */}
            {artisan.respondsIn.replace(/^usually replies /i, "Replies ")}
          </span>
        </>
      );

    case "rating":
    default:
      return <RatingSignal artisan={artisan} />;
  }
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
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-1 px-4 md:hidden">
        {/* The mark sits beside a title in both states — signed in the title
            names you, signed out it names the screen. Dropping the words when
            there is no name left the row reading as a bare logo bar. */}
        <h1 className="text-lg font-bold flex min-w-0 items-center text-ink">
          <BrandMark className="size-9 shrink-0" />
          <span className="truncate">
            {firstName ? `For ${firstName}` : "For You"}
            <span className="text-accent">.</span>
          </span>
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

            {/* Not a filter — the one action pill in the row, so it wears the
                accent and sits last, after the register's own controls. */}
            <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-line" />
            <ApplyControl />
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
  onAsk,
}: {
  filters: Filters;
  results: Artisan[];
  onClear: () => void;
  onOpen: (artisan: Artisan) => void;
  onAsk: () => void;
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
        /* A filter that matched nobody is the same dead end search hits, so it
           gets the same answer: the trade they asked for is already known, so
           the request opens with it filled in. */
        <div className="mt-4">
          <RequestPrompt
            heading={
              filters.trade
                ? `No ${TRADE_LABELS[filters.trade].toLowerCase()}s listed yet`
                : "Nothing matches those filters"
            }
            body="The register is still filling up. Tell us what you need and leave your number — the team goes looking and calls you back."
            onAsk={onAsk}
            secondary={{ label: "Clear filters", onSelect: onClear }}
          />
        </div>
      ) : (
        <>
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

          <div className="mt-5">
            <RequestPrompt
              tone="quiet"
              heading="Not the one?"
              body="We'll find someone who fits and call you back."
              cta="Ask us"
              onAsk={onAsk}
            />
          </div>
        </>
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

/**
 * The app mark. The source art is a black rounded square, which would vanish
 * into the bar on its own — the border and lighter plate keep its edge.
 */
function BrandMark({ className }: { className: string }) {
  return (
    <span
      className={`block ${className}`}
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/logo-mark.png)",
        maskImage: "url(/logo-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        maskMode: "luminance",
      }}
      aria-hidden
    />
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
