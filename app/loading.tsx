/**
 * Home draws its own placeholder.
 *
 * This file used to render a page-frame skeleton — large title, search field,
 * trade rail, card grid — which was the shape of the old `BrowseScreen` home.
 * Home is `NetflixHome` now: full bleed, a billboard and poster rails, with
 * its own `BillboardSkeleton` that matches that geometry. Keeping both meant a
 * cold load painted the old layout in grey, then threw it away and painted a
 * different grey layout, then filled in — two skeletons for one page.
 *
 * `NetflixHome` renders on the server with its read still pending, so its
 * skeleton is already in the first HTML. Returning null here costs nothing and
 * removes the wrong-shaped frame in front of it. Every other route reached the
 * same conclusion — see the sibling `loading.tsx` files under account, search,
 * unlocked and admin.
 */
export default function Loading() {
  return null;
}
