import {
  ArtisanGridSkeleton,
  LoadingLabel,
  Skeleton,
} from "../components/Skeleton";

/**
 * The route-level fallback. It does nothing today — every page renders
 * synchronously and fills itself in on the client — but the moment a page
 * awaits the database on the server, this is what Next streams first.
 *
 * It covers every route in the app, so it draws only what they share: the
 * page frame, a large title, and a list. The screen-specific rails are
 * placeheld by their own components once the client takes over.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10">
      <LoadingLabel>Loading</LoadingLabel>

      <Skeleton className="h-10 w-64 rounded-xl" />

      {/* Search field and trade rail: chrome rather than data, but on a cold
          server render nothing is painted yet, so they hold their space. */}
      <Skeleton className="mt-5 h-14 w-full rounded-full" />
      <div
        aria-hidden
        className="no-scrollbar -mx-4 mt-5 flex gap-2.5 overflow-x-hidden px-4 py-1 md:mx-0 md:px-0"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex w-18 shrink-0 flex-col items-center gap-1.5"
          >
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        ))}
      </div>

      <ArtisanGridSkeleton className="mt-7" />
    </div>
  );
}
