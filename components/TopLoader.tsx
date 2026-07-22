import NextTopLoader from "nextjs-toploader";

/**
 * The navigation progress bar.
 *
 * <PageTransition> cross-fades one page into the next, but it can only run
 * once the new page has something to show. The gap before that — the server
 * fetching an artisan, a route without its own `loading.tsx` — is silent, and
 * on a slow Ilisan connection a tap that produces nothing for a second reads
 * as a tap that missed. The bar fills that gap.
 *
 * It listens on document clicks and completes when the App Router commits the
 * navigation (it patches `history.pushState`), so it covers <Link>, the tab
 * bar and back/forward without any of them knowing about it.
 *
 * Config notes, all against STYLEGUIDE.md:
 * - `color` is the accent token, not a hex literal. The component interpolates
 *   this straight into a <style> tag, and `var(--accent)` resolves there like
 *   anywhere else — so the bar follows the palette if the accent ever moves.
 * - No spinner. The bar already says "working"; a second indicator in the
 *   corner is the kind of redundant chrome the styleguide argues against.
 * - 2px rather than the 3px default. At full bleed across the top, 2px is
 *   legible and stops the bar competing with the header border under it.
 * - z-index 130 puts it above the dialog (120), which is the highest surface
 *   in the app — navigation can start from inside one, and a bar hidden
 *   behind the thing that triggered it is worse than no bar.
 *
 * Reduced motion needs no special handling: the global kill-switch in
 * globals.css flattens the bar's transitions along with everything else, so
 * it jumps to done instead of sliding.
 */
export function TopLoader() {
  return (
    <NextTopLoader
      color="var(--accent)"
      height={2}
      speed={300}
      easing="cubic-bezier(0.23, 1, 0.32, 1)"
      showSpinner={false}
      shadow="0 0 10px var(--accent-soft), 0 0 4px var(--accent-soft)"
      zIndex={130}
    />
  );
}
