"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import {
  Artisan,
  Filters,
  NO_FILTERS,
  TRADE_COVERS,
  TRADE_LABELS,
  activeFilterCount,
  filterArtisans,
  newArtisans,
  rankArtisans,
  topRatedArtisans,
  trendingArtisans,
} from "../lib/artisans";
import { useArtisans } from "../lib/useData";
import { useUnlocks } from "../context/UnlocksContext";
import { ArtisanCard, Avatar } from "./ArtisanCard";
import { ArtisanSheet } from "./ArtisanSheet";
import { DiscoveryRail } from "./DiscoveryRail";
import {
  ArtisanGridSkeleton,
  DiscoveryRailSkeleton,
  FeaturedRailSkeleton,
  LoadingLabel,
  Skeleton,
} from "./Skeleton";

/** One screenful: six cards is two full rows on desktop, six scrolls on mobile. */
const PAGE = 6;

/**
 * Renders the register for whatever query the search bar currently holds,
 * and owns the one sheet instance. A single sheet shared by every entry
 * point keeps the open/close transition identical wherever you tapped from.
 */
export function BrowseScreen({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const [selected, setSelected] = useState<Artisan | null>(null);
  const { isUnlocked, unlock } = useUnlocks();

  /* The register arrives asynchronously — a fast API resolves immediately
     today, a query won't. Every cut below derives from what the read
     returned, so nothing here has to change when the database lands. */
  const { artisans, loading, error, retry } = useArtisans();

  const featured = useMemo(
    () => rankArtisans(artisans.filter((a) => a.featured)),
    [artisans]
  );

  /* The three sorted cuts of the same register. Each one answers a different
     question a visitor arrives with: who's busy, who's just been vetted, who
     has the record. */
  const trending = useMemo(() => trendingArtisans(artisans), [artisans]);
  const arrivals = useMemo(() => newArtisans(artisans), [artisans]);
  const topRated = useMemo(() => topRatedArtisans(artisans), [artisans]);

  const results = useMemo(
    () => rankArtisans(filterArtisans(artisans, filters)),
    [artisans, filters]
  );

  /* Every rail above this one is a slice someone chose — promoted, busiest,
     newest, best reviewed. This heading's job is to say that the choosing
     stops here: "Every" is the claim, and a trade filter narrows the same
     sentence without breaking it. Singular, so "Every solar installer"
     works and the awkward plural never appears. */
  const heading = filters.trade
    ? `Every ${TRADE_LABELS[filters.trade].toLowerCase()} in Ilisan`
    : "Every artisan in Ilisan";

  /* The register is a browse surface, not an index: the first page is what
     anyone actually reads, and the rails above already made the case for the
     ones worth seeing first. The rest is one tap away.

     Expansion is stored as the query it belongs to rather than a boolean, so
     changing trade collapses the list back without an effect to reset it. */
  const [expandedFor, setExpandedFor] = useState<Filters | null>(null);
  const expanded = expandedFor === filters;
  const shown = expanded ? results : results.slice(0, PAGE);
  const more = results.length - shown.length;

  /* Promotion and discovery both only lead an unfiltered screen. Once someone
     has said what they want, a rail that ignores it reads as noise — and the
     results they asked for should be the next thing they see. */
  const browsing = activeFilterCount(filters) === 0;

  /* A failed read is not an empty register — saying "nobody listed here"
     when the query fell over would be a lie, and it hides the retry. */
  if (error) {
    return (
      <section className="mt-7">
        <h2 className="title text-ink">{heading}</h2>
        <div className="mt-4 rounded-2xl bg-card p-8 text-center">
          <p className="text-sm text-sub">
            The register didn&apos;t load. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={retry}
            className="pressable hover-fill mt-4 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  /* Placeholders trace the layout the read is about to fill: same rails in
     the same order, same card geometry, real headings. The section titles
     are copy rather than data, so they are already true. */
  if (loading) {
    return (
      <>
        <LoadingLabel>Loading artisans</LoadingLabel>

        {browsing && (
          <>
            <FeaturedRailSkeleton />
            <DiscoveryRailSkeleton kind="trending" />
            <DiscoveryRailSkeleton kind="new" />
            <DiscoveryRailSkeleton kind="top-rated" />
          </>
        )}

        <section className="mt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="title text-ink">{heading}</h2>
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <ArtisanGridSkeleton />
        </section>
      </>
    );
  }

  return (
    <>
      {browsing && featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="mt-7">
          <h2 id="featured-heading" className="title text-ink">
            Featured
          </h2>
          {/* Snap carousel, edge-to-edge on mobile. Snap points align to the
              scrollport, not the content box, so the rail needs matching
              scroll-padding or the first card lands flush against the edge. */}
          <div className="no-scrollbar -mx-4 mt-3 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 md:mx-0 md:scroll-px-0 md:px-0">
            <ul className="flex w-max gap-3">
              {featured.map((artisan) => (
                <li key={artisan.id} className="snap-start">
                  <FeaturedCard
                    artisan={artisan}
                    onOpen={() => setSelected(artisan)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {browsing && (
        <>
          <DiscoveryRail
            kind="trending"
            artisans={trending}
            onOpen={setSelected}
          />
          <DiscoveryRail kind="new" artisans={arrivals} onOpen={setSelected} />
          <DiscoveryRail
            kind="top-rated"
            artisans={topRated}
            onOpen={setSelected}
          />
        </>
      )}

      <section aria-labelledby="browse-heading" className="mt-7">
        <div className="flex items-baseline justify-between">
          <h2 id="browse-heading" className="title text-ink">
            {heading}
          </h2>
          {/* The count was a readout; as a button it does the same job and
              also says what tapping gets you. It only appears when there is
              actually something held back. */}
          {more > 0 ? (
            <button
              type="button"
              onClick={() => setExpandedFor(filters)}
              className="pressable shrink-0 text-[0.8125rem] font-semibold text-accent"
            >
              View all {">"}
            </button>
          ) : expanded && results.length > PAGE ? (
            <button
              type="button"
              onClick={() => setExpandedFor(null)}
              className="pressable shrink-0 text-[0.8125rem] font-semibold text-accent"
            >
              Show fewer
            </button>
          ) : (
            <p className="caption shrink-0">
              {results.length} {results.length === 1 ? "artisan" : "artisans"}
            </p>
          )}
        </div>

        {results.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-card p-8 text-center">
            <p className="text-sm text-sub">
              {activeFilterCount(filters) > 1
                ? "Nothing matches all of those at once. Drop a filter — the team adds artisans weekly."
                : "Nobody listed here yet. Try another trade — the team adds artisans weekly."}
            </p>
            <button
              type="button"
              onClick={() => onChange(NO_FILTERS)}
              className="pressable hover-fill mt-4 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((artisan) => (
              <li key={artisan.id}>
                <ArtisanCard
                  artisan={artisan}
                  unlocked={isUnlocked(artisan.id)}
                  onOpen={() => setSelected(artisan)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ArtisanSheet
        artisan={selected}
        onClose={() => setSelected(null)}
        unlocked={selected ? isUnlocked(selected.id) : false}
        onUnlock={() => selected && void unlock(selected.id, selected.name)}
      />
    </>
  );
}

/**
 * Featured is a promoted slot, so it gets the app's most image-forward
 * treatment: the work fills the card and the type sits on top of it.
 */
function FeaturedCard({
  artisan,
  onOpen,
}: {
  artisan: Artisan;
  onOpen: () => void;
}) {
  const cover = artisan.work[0] ?? TRADE_COVERS[artisan.trade];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="pressable group relative flex h-56 w-64 flex-col justify-end overflow-hidden rounded-2xl bg-fill p-4 text-left"
    >
      <Image
        src={cover}
        alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
        fill
        sizes="256px"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10"
      />

      <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
        Featured
      </span>

      <div className="relative flex items-end gap-2.5">
        <Avatar
          name={artisan.name}
          src={artisan.photo}
          size="size-11"
          className="ring-2 ring-white/70"
        />
        <div className="min-w-0 flex-1">
          <p className="headline flex items-center gap-1.5 text-white">
            <span className="truncate">{artisan.name}</span>
            <BadgeCheck
              size={15}
              strokeWidth={2.2}
              className="shrink-0 text-white"
              aria-label="Verified"
            />
          </p>
          <p className="caption text-white/75">{TRADE_LABELS[artisan.trade]}</p>
        </div>
      </div>

      <p className="figure relative mt-2.5 flex items-center gap-3 text-sm text-white">
        <span className="flex items-center gap-1">
          <Star size={13} strokeWidth={2.2} fill="currentColor" aria-hidden />
          {artisan.rating.toFixed(1)}
          <span className="font-normal text-white/70">
            ({artisan.reviewCount})
          </span>
        </span>
        <span>
          {artisan.jobsCompleted}
          <span className="ml-1 font-normal text-white/70">jobs</span>
        </span>
      </p>
    </button>
  );
}
