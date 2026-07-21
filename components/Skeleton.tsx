import { RAILS, RailKind } from "./DiscoveryRail";

/**
 * Loading placeholders for every surface that will be fed by the database.
 *
 * Each one mirrors the geometry of the component it stands in for — same
 * aspect ratios, same paddings, same line heights — so the swap from
 * placeholder to real content is a fade, never a jump. If a real component
 * changes shape, its skeleton changes with it.
 *
 * They are all `aria-hidden`; the loading state is announced once by the
 * region that owns them, not once per shape.
 */

/** The one primitive. Callers bring the size and the radius. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton block ${className}`} />;
}

/** Announces a loading region to screen readers without any visuals. */
export function LoadingLabel({ children }: { children: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {children}
    </span>
  );
}

/**
 * Stands in for `ArtisanCard`. The cover, the lapping portrait and the
 * footer rule are all real geometry — only the type is placeheld, because
 * grey bars where a name will be are honest about what's coming.
 */
export function ArtisanCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Skeleton className="aspect-16/10 w-full" />

      <div className="flex w-full flex-1 flex-col p-4">
        {/* Same lap as the real portrait, ring included, so the card's
            vertical rhythm doesn't shift when the photo arrives. */}
        <Skeleton className="relative z-10 -mt-12 size-14 rounded-full ring-4 ring-card" />

        <Skeleton className="mt-2.5 h-4.25 w-32 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-24 rounded-md" />

        <Skeleton className="mt-3.5 h-3.5 w-full rounded-md" />
        <Skeleton className="mt-1.5 h-3.5 w-4/5 rounded-md" />

        <Skeleton className="mt-3.5 h-3.5 w-40 rounded-md" />

        <div className="mt-3 flex-1" />

        <div className="flex w-full items-center justify-between border-t border-line pt-3">
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="size-4 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Stands in for `FeaturedCard` — one photographic slab, nothing on it. */
export function FeaturedCardSkeleton() {
  return <Skeleton className="h-56 w-64 rounded-2xl" />;
}

/**
 * The featured carousel while the promoted slots load. Headings are static
 * copy, not data, so they render for real — only the cards are placeheld,
 * and the section doesn't retitle itself when the read lands.
 *
 * Three cards: enough for the rail to overflow, so the horizontal scroll
 * affordance is there from the first paint.
 */
export function FeaturedRailSkeleton() {
  return (
    <section className="mt-7">
      <h2 className="title text-ink">Featured</h2>
      <div className="no-scrollbar -mx-4 mt-3 overflow-x-hidden px-4 md:mx-0 md:px-0">
        <ul aria-hidden className="flex w-max gap-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <FeaturedCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Stands in for a `DiscoveryRail` — same 176px card, same 4:3 work photo. */
export function DiscoveryRailSkeleton({ kind }: { kind: RailKind }) {
  const { heading, rule } = RAILS[kind];

  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="title text-ink">{heading}</h2>
        <p className="caption shrink-0">{rule}</p>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 overflow-x-hidden px-4 md:mx-0 md:px-0">
        <ul aria-hidden className="flex w-max gap-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>
              <div className="flex w-44 flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <Skeleton className="aspect-4/3 w-full" />
                <div className="flex w-full flex-col p-3">
                  <Skeleton className="relative z-10 -mt-9 size-10 rounded-full ring-4 ring-card" />
                  <Skeleton className="mt-2 h-3.5 w-24 rounded-md" />
                  <Skeleton className="mt-1.5 h-3 w-20 rounded-md" />
                  <Skeleton className="mt-3.5 h-3 w-28 rounded-md" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Stands in for the search results list — same grouped card, same row
 * height, same dividers, so results drop into place instead of pushing
 * the page around.
 */
export function ResultRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="mt-6">
      <Skeleton className="h-3 w-32 rounded-md" />
      <ul
        aria-hidden
        className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="flex items-center gap-3 p-3.5">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <span className="min-w-0 flex-1">
              <Skeleton className="h-4.25 w-36 rounded-md" />
              <Skeleton className="mt-1.5 h-3 w-28 rounded-md" />
            </span>
            <Skeleton className="h-3.5 w-7 rounded-md" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Stands in for `BannerRail`, matching its widths and aspect at each step. */
export function BannerRailSkeleton() {
  return (
    <section aria-label="Offers" className="mt-5">
      <ul aria-hidden className="no-scrollbar -mx-4 flex gap-3 overflow-x-hidden px-4 md:mx-0 md:px-0">
        {[0, 1].map((i) => (
          <li
            key={i}
            className="flex w-[85%] shrink-0 sm:w-[60%] lg:w-[46%]"
          >
            <Skeleton className="aspect-2/1 w-full rounded-2xl sm:aspect-5/2" />
          </li>
        ))}
      </ul>
      {/* The dots are a position readout, so they hold their place rather
          than appearing late and nudging the list down. */}
      <div aria-hidden className="mt-2.5 flex justify-center gap-1.5">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="size-1.5 rounded-full" />
        ))}
      </div>
    </section>
  );
}

/**
 * The register itself. Six cards is one full screen on mobile and two rows
 * on desktop — past that, placeholders promise more than the page will
 * likely hold.
 */
export function ArtisanGridSkeleton({
  count = 6,
  className = "mt-4",
}: {
  count?: number;
  /** Top margin, so the placeholder grid sits exactly where the real one will. */
  className?: string;
}) {
  return (
    <ul aria-hidden className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <ArtisanCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
