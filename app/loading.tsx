import { BillboardSkeleton } from "../components/NetflixHome";

/**
 * The fallback Next streams while `app/page.tsx` awaits the register.
 *
 * This used to draw a page-frame skeleton — large title, search field, trade
 * rail, card grid — which was the shape of the old `BrowseScreen` home. Home is
 * `NetflixHome` now, so that placeholder promised a layout the page no longer
 * has: a cold load painted the old shape in grey, threw it away, then painted
 * the billboard. Two skeletons of different shapes for one page.
 *
 * It renders the billboard skeleton itself rather than a copy of its geometry,
 * so the two can't drift apart again. Poster widths live in `POSTER_WIDTH`
 * for the same reason.
 */
export default function Loading() {
  return (
    <div className="min-h-screen pb-28 md:pb-16">
      <div className="mx-auto w-full max-w-[96rem] md:px-8 lg:px-12">
        <BillboardSkeleton />
      </div>
    </div>
  );
}
